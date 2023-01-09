import {
    buildBlobDataPath,
    APIM_EDITOR_DATA_KEY,
    EditorData,
    Environment,
    ValuesCommon
} from "@azure/api-management-custom-widgets-tools";
import * as Constants from "../../../constants";
import { MapiBlobStorage } from "../../../persistence";
import { CustomWidgetModel } from "../customWidgetModel";

export async function buildWidgetSource(
    blobStorage: MapiBlobStorage,
    model: CustomWidgetModel,
    environment: Environment,
    filePath: string,
): Promise<{ override: string | null, src: string }> {
    // check is necessary during publishing as window.sessionStorage.getItem throws "DOMException {}  node:internal/process/promises:279"
    const developmentSrc = environment !== "publishing"
        ? window.sessionStorage.getItem(Constants.overrideConfigSessionKeyPrefix + model.name)
        : null;

    const url = new URL(developmentSrc == null ? (
        await blobStorage.getDownloadUrlWithoutToken(`${buildBlobDataPath(model.name)}${filePath}`)
    ) : developmentSrc + filePath);

    url.pathname = decodeURIComponent(url.pathname);

    const data: EditorData<ValuesCommon> = {
        values: JSON.parse(model.customInputValue).values ?? {},
        // origin: window.location.origin, // TODO later once connected to BE origin during publish
        instanceId: model.instanceId,
        environment,
    };
    url.searchParams.append(APIM_EDITOR_DATA_KEY, encodeURIComponent(JSON.stringify(data)));

    const src = url.toString();

    return {override: developmentSrc, src};
}
