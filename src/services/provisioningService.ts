import { HttpClient, HttpRequest } from "@paperbits/common/http";
import { IAuthenticator } from "../authentication";
import { ViewManager } from "@paperbits/common/ui";
import { Router } from "@paperbits/common/routing";
import { Utils } from "../utils";
import { AzureBlobStorage } from "@paperbits/azure";
import * as Constants from "../constants";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { MapiClient } from "./mapiClient";

export class ProvisionService {
    constructor(
        private readonly httpClient: HttpClient,
        private readonly settingsProvider: ISettingsProvider,
        private readonly authenticator: IAuthenticator,
        private readonly viewManager: ViewManager,
        private readonly router: Router,
        private readonly blobStorage: AzureBlobStorage
    ) { }

    private async fetchData(url: string): Promise<Object> {
        const response = await this.httpClient.send({ url: url, method: "GET" });
        return response.toObject();
    }

    private async getManagementUrl(): Promise<string> {
        const settings = await this.settingsProvider.getSettings();
        const managementApiUrl = settings[Constants.SettingNames.managementApiUrl];

        if (!managementApiUrl) {
            throw new Error(`Management API URL ("managementApiUrl") setting is missing in configuration file.`);
        }
        return Utils.ensureUrlArmified(managementApiUrl);
    }

    public async provision(): Promise<void> {
        const managementApiUrl = await this.getManagementUrl();
        const dataUrl = `/editors/themes/default.json`;

        try {
            const dataObj = await this.fetchData(dataUrl);
            const keys = Object.keys(dataObj);
            const accessToken = await this.authenticator.getAccessTokenAsString();

            if (!accessToken) {
                this.viewManager.notifyError(`Unable to setup website`, `Management API access token is empty or invald.`);
            }

            for (const key of keys) {
                const contentItem = dataObj[key];
                const url = `${managementApiUrl}${Utils.ensureLeadingSlash(key)}?api-version=${Constants.managementApiVersion}`;

                const request: HttpRequest = {
                    url: url,
                    method: "PUT",
                    headers: [
                        { name: "If-Match", value: "*" },
                        { name: "Content-Type", value: "application/json" },
                        { name: "Authorization", value: accessToken },
                        MapiClient.getPortalHeader("provision")
                    ],
                    body: JSON.stringify({ properties: contentItem })
                };

                const response = await this.httpClient.send(request);

                if (response.statusCode >= 400) {
                    throw new Error("Unable to setup website.");
                }
            }
            this.router.navigateTo("/");
            this.viewManager.setHost({ name: "page-host" });
            this.viewManager.showToolboxes();
        }
        catch (error) {
            throw error;
        }
    }

    private async cleanupContent(): Promise<void> {
        const managementApiUrl = await this.getManagementUrl();
        const accessToken = await this.authenticator.getAccessTokenAsString();

        try {
            const request: HttpRequest = {
                url: `${managementApiUrl}/contentTypes?api-version=${Constants.managementApiVersion}`,
                method: "GET",
                headers: [
                    { name: "If-Match", value: "*" },
                    { name: "Content-Type", value: "application/json" },
                    { name: "Authorization", value: accessToken },
                    MapiClient.getPortalHeader("getContentTypes")
                ],
            };
            const response = await this.sendRequest(request);
            const contentTypes = Object.values(response["value"]);
            for (const contentType of contentTypes) {
                const contentTypeName = contentType["name"];
                const curReq: HttpRequest = {
                    url: `${managementApiUrl}/contentTypes/${contentTypeName}/contentItems?api-version=${Constants.managementApiVersion}`,
                    method: "GET",
                    headers: [
                        { name: "If-Match", value: "*" },
                        { name: "Content-Type", value: "application/json" },
                        { name: "Authorization", value: accessToken },
                        MapiClient.getPortalHeader("getContentItems")
                    ],
                };
                const itemsResponse = await this.sendRequest(curReq);
                const items = Object.values(itemsResponse["value"]);
                for (const item of items) {
                    const itemReq: HttpRequest = {
                        url: `${managementApiUrl}${item["id"]}?api-version=${Constants.managementApiVersion}`,
                        method: "DELETE",
                        headers: [
                            { name: "If-Match", value: "*" },
                            { name: "Content-Type", value: "application/json" },
                            { name: "Authorization", value: accessToken },
                            MapiClient.getPortalHeader("resetContent")
                        ],
                    };
                    await this.sendRequest(itemReq);
                }
            }
        }
        catch (error) {
            throw error;
        }
    }

    private async sendRequest(request: HttpRequest): Promise<Object> {
        const response = await this.httpClient.send(request);
        if (response.statusCode >= 400) {
            throw new Error("Unable to complete HttpRequest");
        }
        if (response.body.length === 0) {
            return;
        }
        return response.toObject();
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