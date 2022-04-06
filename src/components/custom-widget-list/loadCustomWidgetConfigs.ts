import { ISettingsProvider } from "@paperbits/common/configuration";
import { TConfigDeploy, TCustomWidgetConfig } from "scaffold/scaffold";
import { MapiBlobStorage } from "../../persistence";
import {
    root,
    configsFolder,
    configFileName,
    OVERRIDE_CONFIG_SESSION_KEY_PREFIX,
} from "../custom-widget/ko/utils";
import { SettingNames } from "../../constants";

export const buildConfigDeploy = async (settingsProvider: ISettingsProvider): Promise<TConfigDeploy> => ({
    // TODO
    // const managementApiUrl = (await this.settingsProvider.getSetting(SettingNames.managementApiUrl) as string).split("/")[2];
    subscriptionId: "a200340d-6b82-494d-9dbf-687ba6e33f9e",
    resourceGroupName: "jmach",
    serviceName: "apim-resource-jmach",
    managementApiEndpoint: "management.azure.com",
    apiVersion: await settingsProvider.getSetting(SettingNames.managementApiVersion) as string,
});

async function loadCustomWidgetConfigs(blobStorage: MapiBlobStorage): Promise<TCustomWidgetConfig[]> {
    const overridesPromises = [];
    const sourcesSession = Object.keys(window.sessionStorage)
        .filter((key: string) => key.startsWith(OVERRIDE_CONFIG_SESSION_KEY_PREFIX))
        .map(key => window.sessionStorage.getItem(key));
    const sourcesSearchParams = new URLSearchParams(window.location.search)
        .getAll("MS_APIM_CW_localhost_port")
        .map(port => "http://localhost:" + (isNaN(parseInt(port)) ? "3000" : port));
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

    console.log({configs, overrides}); // TODO

    const configurations: Record<string, TCustomWidgetConfig> = {};

    configs.forEach(config => configurations[config.name] = config);
    overrides.forEach((override, i) => {
        const href = new URL(sources[i]).href;
        window.sessionStorage.setItem(OVERRIDE_CONFIG_SESSION_KEY_PREFIX + override.name, href);
        configurations[override.name] = {...override, override: href ?? true};
    });

    return Object.values(configurations);
}

export default loadCustomWidgetConfigs;
