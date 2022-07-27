import { OVERRIDE_PORT_KEY } from "@azure/api-management-custom-widgets-scaffolder";
import {
    buildBlobDataSrc,
    EDITOR_DATA_KEY,
    TEditorData,
    TEnvironment,
    TValuesCommon
} from "@azure/api-management-custom-widgets-tools";
import { MapiBlobStorage } from "../../../persistence";
import { CustomWidgetModel } from "../customWidgetModel";

/**
 * Signals that the widgets' source is being overridden (for local development). Optionally holds URL to overrides' config files.
 */
export const OVERRIDE_CONFIG_SESSION_KEY_PREFIX = OVERRIDE_PORT_KEY + "_";

export async function buildWidgetSource(
    blobStorage: MapiBlobStorage,
    model: CustomWidgetModel,
    environment: TEnvironment,
    filePath: string,
): Promise<{ override: string | null, src: string }> {
    // check is necessary during publishing as window.sessionStorage.getItem throws "DOMException {}  node:internal/process/promises:279"
    const developmentSrc = environment !== "publishing"
        ? window.sessionStorage.getItem(OVERRIDE_CONFIG_SESSION_KEY_PREFIX + model.name)
        : null;

    // tslint:disable-next-line:triple-equals
    const url = new URL(developmentSrc == null ? (
        await blobStorage.getDownloadUrlWithoutToken(`${buildBlobDataSrc(model.name)}${filePath}`)
    ) : developmentSrc + filePath);

    url.pathname = decodeURIComponent(url.pathname);

    const data: TEditorData<TValuesCommon> = {
        values: JSON.parse(model.customInputValue).values,
        origin: window.location.origin, // TODO later once connected to BE origin during publish
        instanceId: model.instanceId,
        environment,
    };
    url.searchParams.append(EDITOR_DATA_KEY, encodeURIComponent(JSON.stringify(data)));

    return {override: developmentSrc, src: url.toString()};
}
