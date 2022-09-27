import { ViewManager } from "@paperbits/common/ui";
import { OVERRIDE_PORT_KEY, OVERRIDE_DEFAULT_PORT } from "@azure/api-management-custom-widgets-scaffolder";
import { BLOB_ROOT, BLOB_CONFIGS_FOLDER, APIM_CONFIG_FILE_NAME } from "@azure/api-management-custom-widgets-tools";
import * as Constants from "../../constants";
import { MapiBlobStorage } from "../../persistence";
import { TCustomWidgetConfig } from "../custom-widget";

export async function listConfigBlobs(blobStorage: MapiBlobStorage): Promise<TCustomWidgetConfig[]> {
    const configsNames = await blobStorage.listBlobs(`${BLOB_ROOT}/${BLOB_CONFIGS_FOLDER}/`);
    const configsUint8s = await Promise.all(configsNames.map(blobName => blobStorage.downloadBlob(blobName)));
    return configsUint8s.map(uint8 => JSON.parse(new TextDecoder().decode(uint8)));
}

function showToast(viewManager: ViewManager, widgetSource: TCustomWidgetConfig): void {
    const sessionStorageKey = Constants.overrideToastSessionKeyPrefix + widgetSource.name
    if (window.sessionStorage.getItem(sessionStorageKey)) return

    let message = `Custom widget "${widgetSource.displayName}" URL is overridden`;
    if (typeof widgetSource.override === "string") message += ` with ${widgetSource.override}`;
    const toast = viewManager.addToast(widgetSource.displayName, message, [{
        title: "Got it",
        action: async () => {
            window.sessionStorage.setItem(sessionStorageKey, "true");
            viewManager.removeToast(toast);
        }
    }]);
}

export async function loadCustomWidgetConfigs(
    blobStorage: MapiBlobStorage,
    viewManager: ViewManager,
): Promise<TCustomWidgetConfig[]> {
    const sourcesSessionKeys = Object.keys(window.sessionStorage)
        .filter((key: string) => key.startsWith(Constants.overrideConfigSessionKeyPrefix))
    const sourcesSession = sourcesSessionKeys.map(key => window.sessionStorage.getItem(key));
    const sourcesSearchParams = new URLSearchParams(window.location.search)
        .getAll(OVERRIDE_PORT_KEY)
        .map(port => new URL("http://localhost:" + (isNaN(parseInt(port)) ? OVERRIDE_DEFAULT_PORT : port)).href);
    const sources = [...new Set([...sourcesSession, ...sourcesSearchParams])];
    const overridesPromises = sources.map(async source => {
        try {
            return {
                source,
                override: await (await fetch(new URL(source).href + APIM_CONFIG_FILE_NAME)).json() as TCustomWidgetConfig
            };
        } catch (e) {
            console.warn(`Could not load Custom widget override config from ${source}!`, e);
            return {source, override: undefined};
        }
    });

    const configurations: Record<string, TCustomWidgetConfig> = {};
    (await listConfigBlobs(blobStorage)).forEach(config => configurations[config.name] = config);

    (await Promise.all(overridesPromises)).forEach(({override, source}) => {
        if (!override) {
            const key = sourcesSessionKeys.find(key => window.sessionStorage.getItem(key) === source);
            if (key) sessionStorage.removeItem(key);
            return;
        }

        const href = new URL(source).href;
        window.sessionStorage.setItem(Constants.overrideConfigSessionKeyPrefix + override.name, href);
        const widgetSource = {...override, override: href ?? true};
        configurations[override.name] = widgetSource

        showToast(viewManager, widgetSource);
    });

    return Object.values(configurations);
}
