import { HttpClient } from "@paperbits/common/http";
import { IAuthenticator } from "../authentication";
import { ViewManager } from "@paperbits/common/ui";
import { Router } from "@paperbits/common/routing";
import { AzureBlobStorage } from "@paperbits/azure";
import { ISettingsProvider } from "@paperbits/common/configuration/ISettingsProvider";
import { Logger } from "@paperbits/common/logging/logger";
import * as Constants from "../constants";
import { IApiClient } from "../clients";
import { KnownMimeTypes } from "../models/knownMimeTypes";
import { KnownHttpHeaders } from "../models/knownHttpHeaders";
import { Utils } from "../utils";

export class ProvisionService {
    constructor(
        private readonly httpClient: HttpClient,
        private readonly apiClient: IApiClient,
        private readonly authenticator: IAuthenticator,
        private readonly viewManager: ViewManager,
        private readonly router: Router,
        private readonly blobStorage: AzureBlobStorage,
        private readonly settingsProvider: ISettingsProvider,
        private readonly logger: Logger
    ) { }

    private async fetchData(url: string): Promise<Object> {
        const response = await this.httpClient.send({ url: url, method: "GET" });
        return response.toObject();
    }

    public async provision(): Promise<void> {
        const isOldThemeEnabled = await Utils.checkIsFeatureEnabled(Constants.FEATURE_OLD_THEME, this.settingsProvider, this.logger);
        const applyOldTheme = localStorage.getItem(Constants.isApplyNewThemeEnabledSetting) !== "true";
        const dataUrl = (isOldThemeEnabled || applyOldTheme) ? `/editors/templates/default-old.json` : `/editors/templates/default.json`;
        const dataObj = await this.fetchData(dataUrl);
        const keys = Object.keys(dataObj);
        const accessToken = await this.authenticator.getAccessTokenAsString();

        if (!accessToken) {
            this.viewManager.notifyError(`Unable to setup website`, `Management API access token is empty or invalid.`);
        }

        for (const key of keys) {
            const contentItem = dataObj[key];
            const url = `${key}`;
            await this.apiClient.put(
                url,
                [
                    { name: KnownHttpHeaders.IfMatch, value: "*" },
                    { name: KnownHttpHeaders.ContentType, value: KnownMimeTypes.Json },
                    { name: KnownHttpHeaders.Authorization, value: accessToken },
                    await this.apiClient.getPortalHeader("provision")
                ],
                contentItem);
        }
        this.router.navigateTo(Constants.pageUrlHome);
        this.viewManager.setHost({ name: "page-host" });
        this.viewManager.showToolboxes();
    }

    private async cleanupContent(): Promise<void> {
        const accessToken = await this.authenticator.getAccessTokenAsString();

        const response = await this.apiClient.get(
            `contentTypes`,
            [
                { name: KnownHttpHeaders.IfMatch, value: "*" },
                { name: KnownHttpHeaders.ContentType, value: KnownMimeTypes.Json },
                { name: KnownHttpHeaders.Authorization, value: accessToken },
                await this.apiClient.getPortalHeader("getContentTypes")
            ]);
        const contentTypes = Object.values(response["value"]);

        for (const contentType of contentTypes) {
            const contentTypeName = contentType["name"];
            const itemsResponse = await this.apiClient.get(
                `contentTypes/${contentTypeName}/contentItems`,
                [
                    { name: KnownHttpHeaders.IfMatch, value: "*" },
                    { name: KnownHttpHeaders.ContentType, value: KnownMimeTypes.Json },
                    { name: KnownHttpHeaders.Authorization, value: accessToken },
                    await this.apiClient.getPortalHeader("getContentItems")
                ]);

            const items = Object.values(itemsResponse["value"]);
            for (const item of items) {
                await this.apiClient.delete(
                    `${item["id"]}`,
                    [
                        { name: KnownHttpHeaders.IfMatch, value: "*" },
                        { name: KnownHttpHeaders.ContentType, value: KnownMimeTypes.Json },
                        { name: KnownHttpHeaders.Authorization, value: accessToken },
                        await this.apiClient.getPortalHeader("resetContent")
                    ]);
            }
        }
    }

    private async cleanupBlobs(): Promise<void> {
        const blobs = await this.blobStorage.listBlobs();

        for (const blob of blobs) {
            try {
                await this.blobStorage.deleteBlob(blob);
            }
            catch (error) {
                console.warn(`Unable to delete blob "${blob}"`);
            }
        }
    }

    public async cleanup(): Promise<void> {
        await this.cleanupBlobs();
        await this.cleanupContent();
    }
}