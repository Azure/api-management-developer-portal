import { TConfigDeploy, TCustomWidgetConfig, OVERRIDE_PORT_KEY, OVERRIDE_DEFAULT_PORT } from "scaffold/scaffold";
import { managementApiVersion } from "../../constants";
import { MapiBlobStorage } from "../../persistence";
import {
    root,
    configsFolder,
    configFileName,
    OVERRIDE_CONFIG_SESSION_KEY_PREFIX,
} from "../custom-widget/ko/utils";

export const buildConfigDeploy = async (): Promise<TConfigDeploy> => ({ // TODO
    subscriptionId: "a200340d-6b82-494d-9dbf-687ba6e33f9e",
    resourceGroupName: "jmach",
    serviceName: "jm-apim",
    managementApiEndpoint: "management.azure.com",
    apiVersion: managementApiVersion,
    openUrl: window.location.origin,
});

async function loadCustomWidgetConfigs(blobStorage: MapiBlobStorage): Promise<TCustomWidgetConfig[]> {
    const overridesPromises = [];
    const sourcesSession = Object.keys(window.sessionStorage)
        .filter((key: string) => key.startsWith(OVERRIDE_CONFIG_SESSION_KEY_PREFIX))
        .map(key => window.sessionStorage.getItem(key));
    const sourcesSearchParams = new URLSearchParams(window.location.search)
        .getAll(OVERRIDE_PORT_KEY)
        .map(port => new URL("http://localhost:" + (isNaN(parseInt(port)) ? OVERRIDE_DEFAULT_PORT : port)).href);
    const sources = [...new Set([...sourcesSession, ...sourcesSearchParams])];
    if (sources.length) {
        sources.forEach(source => {
            try {
                const url = new URL(source);
                overridesPromises.push(fetch(url.href + configFileName));
            } catch (e) {
                console.warn(source, e);
            }
        });
    }

    const configsNames = await blobStorage.listBlobs(`${root}/${configsFolder}/`);
    const configsUint8s = await Promise.all(configsNames.map(blobName => blobStorage.downloadBlob(blobName)));
    const configs: TCustomWidgetConfig[] = configsUint8s.map(uint8 => JSON.parse(new TextDecoder().decode(uint8)));

    const promisesToJson = async promises => Promise.all(await Promise.all(promises).then(r => r.map(e => e.json())));
    const overrides: TCustomWidgetConfig[] = await promisesToJson(overridesPromises);

    const configurations: Record<string, TCustomWidgetConfig> = {};

    console.log({configurations, configs, overrides, sources}); // TODO

    configs.forEach(config => configurations[config.name] = config);
    overrides.forEach((override, i) => {
        const href = new URL(sources[i]).href;
        window.sessionStorage.setItem(OVERRIDE_CONFIG_SESSION_KEY_PREFIX + override.name, href);
        configurations[override.name] = {...override, override: href ?? true};
    });

    return Object.values(configurations);
}

export default loadCustomWidgetConfigs;
