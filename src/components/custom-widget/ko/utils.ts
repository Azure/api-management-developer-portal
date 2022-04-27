import { OVERRIDE_PORT_KEY, TCustomWidgetConfig } from "scaffold/scaffold";
import { MapiBlobStorage } from "../../../persistence";
import { CustomWidgetModel } from "../customWidgetModel";

export const OVERRIDE_CONFIG_SESSION_KEY_PREFIX = OVERRIDE_PORT_KEY + "_";

export const root = "custom-widgets";
export const dataFolder = "data";
export const configsFolder = "configs";
export const configFileName = "config.msapim.json";

export const widgetArchiveName = (config: TCustomWidgetConfig) => `azure-api-management-widget-${config.name}.zip`;

export function buildBlobDataSrc(name: string): string {
    return `/${root}/${dataFolder}/${name}`;
}

export function buildBlobConfigSrc(name: string): string {
    return `/${root}/${configsFolder}/${name}/${configFileName}`;
}

export async function buildWidgetSource(
    blobStorage: MapiBlobStorage,
    model: CustomWidgetModel,
    environment: string,
    instanceId: number,
    filePath: string,
): Promise<{ override: string | null, src: string }> {
    // check is necessary during publishing as window.sessionStorage.getItem throws "DOMException {}  node:internal/process/promises:279"
    const developmentSrc = environment !== "publishing"
        ? window.sessionStorage.getItem(OVERRIDE_CONFIG_SESSION_KEY_PREFIX + model.name)
        : null;

    // tslint:disable-next-line:triple-equals
    const url = new URL(developmentSrc == null ? (
        await blobStorage.getDownloadUrlWithoutToken(`${buildBlobDataSrc(model.name)}/${filePath}`)
    ) : developmentSrc + filePath);

    url.pathname = decodeURIComponent(url.pathname);

    const values = {
        data: JSON.parse(model.customInputValue).data,
        origin: window.location.origin, // TODO later once connected to BE origin during publish
        id: model.name,
        displayName: model.widgetDisplayName,
        environment,
        instanceId,
    };
    url.searchParams.append("editorValues", encodeURIComponent(JSON.stringify(values)));

    return {override: developmentSrc, src: url.toString()};
}
