import { OVERRIDE_CONFIG_SESSION_KEY_PREFIX } from "../custom-widget/ko/utils";
import { TCustomWidgetConfig } from "scaffold/scaffold";

async function loadCustomWidgetConfigs(): Promise<TCustomWidgetConfig[]> {
    const configsPromises = [];

    // TODO load configs from blob storage async

    const overridesPromises = [];

    /* load overrides */
    const sourcesSession = Object.keys(window.sessionStorage)
        .filter((key: string) => key.startsWith(OVERRIDE_CONFIG_SESSION_KEY_PREFIX))
        .map(key => window.sessionStorage.getItem(key));
    const sourcesSearchParams = new URLSearchParams(window.location.search).getAll("MS_APIM_CW_devsrc");
    const sources = [...new Set([...sourcesSession, ...sourcesSearchParams])];
    if (sources.length) {
        sources.forEach(source => {
            try {
                const url = new URL(source);
                overridesPromises.push(fetch(url.href + "config.msapim.json"));
            } catch (e) {
                console.warn(source, e);
            }
        });
    }

    const promisesToJson = async promises => Promise.all(await Promise.all(promises).then(r => r.map(e => e.json())));
    const configs: TCustomWidgetConfig[] = [{
        name: "test-uri",
        displayName: "Test URI",
        category: "Custom widgets",
        tech: "react",
        deployed: {},
    }, {
        name: "test-uri-x",
        displayName: "Test URI X",
        category: "Custom widgets",
        tech: "react",
        deployed: {},
    }]; // await promisesToJson(configsPromises);
    const overrides: TCustomWidgetConfig[] = await promisesToJson(overridesPromises);

    console.log({configs, overrides});

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
