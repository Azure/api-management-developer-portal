import {
    buildBlobDataPath,
    APIM_EDITOR_DATA_KEY,
    EditorData,
    Environment,
    ValuesCommon,
    BLOB_ROOT,
    BLOB_DATA_FOLDER
} from "@azure/api-management-custom-widgets-tools";
import * as Constants from "../../../constants";
import { MapiBlobStorage } from "../../../persistence";
import { CustomWidgetModel } from "../customWidgetModel";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { Logger } from "@paperbits/common/logging";
const PUBLISHING_HOST = "https://localhost";

const customWidgetNamePrefix = "CustomWidget-"

export const customWidgetPrefixName = (name: string): string => {
    return customWidgetNamePrefix + name;
}

export const customWidgetRemovePrefixName = (name: string): string => {
    return name.startsWith(customWidgetNamePrefix) ? name.replace(customWidgetNamePrefix, "") : name; // replace first occurrence only
}

export async function buildWidgetSource(
    blobStorage: MapiBlobStorage,
    model: CustomWidgetModel,
    settingsProvider: ISettingsProvider,
    filePath: string,
    logger: Logger
): Promise<{ override: string | null, src: string }> {
    const name = customWidgetRemovePrefixName(model.name);
    let developmentSrc = null;
    let urlString = "";
    const environment = await settingsProvider.getSetting<Environment>("environment");

    if (environment === "publishing") {
        urlString = `${PUBLISHING_HOST}/content/${BLOB_ROOT}/${name}/${filePath}`;
    } else {
        // check is necessary during publishing as window.sessionStorage.getItem throws "DOMException {}  node:internal/process/promises:279"
        developmentSrc = window.sessionStorage.getItem(Constants.overrideConfigSessionKeyPrefix + name);
    }

    if (!urlString) {
        if (!developmentSrc) {
            const backendUrl = (await settingsProvider.getSetting<string>("backendUrl")) || location.origin;
            const proxyEditorContentRequests = await getFeatureFlagIsEnabled("proxyEditorContentRequests");

            if (proxyEditorContentRequests == true) {
                urlString = `${backendUrl}/editors_content/${BLOB_ROOT}/${BLOB_DATA_FOLDER}/${name}/${filePath}`;
                logger?.trackEvent("BuildWidgetSource", { message: "Proxy requests through backend" });
            } else {
                urlString = await blobStorage.getDownloadUrlWithoutToken(`${buildBlobDataPath(name)}${filePath}`);
                logger?.trackEvent("BuildWidgetSource", { message: "Direct requests to storage" });
            }
        } else {
            urlString = developmentSrc + filePath;
        }
    }

    const url = new URL(urlString);
    url.pathname = decodeURIComponent(url.pathname);

    const data: EditorData<ValuesCommon> = {
        values: JSON.parse(model.customInputValue).values ?? {},
        instanceId: model.instanceId,
        environment
    };
    url.searchParams.append(APIM_EDITOR_DATA_KEY, encodeURIComponent(JSON.stringify(data)));
    let src = url.toString();

    if (environment === "publishing") {
       src = src.replace(PUBLISHING_HOST, "");
    }

    return { override: developmentSrc, src };

    async function getFeatureFlagIsEnabled(featureFlagName: string): Promise<boolean> {
        try {
            const settingsObject = await settingsProvider.getSetting("featureFlags");

            const featureFlags = new Map(Object.entries(settingsObject ?? {}));
            if (!featureFlags || !featureFlags.has(featureFlagName)) {
                return false;
            }

            return featureFlags.get(featureFlagName) == true;
        } catch (error) {
            logger?.trackEvent("BuildWidgetSource", { message: "Feature flag check failed", data: error.message });
            return false;
        }
    }
}
