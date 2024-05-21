import { HttpClient } from "@paperbits/common/http";
import { IAuthenticator } from "../authentication";
import { ViewManager } from "@paperbits/common/ui";
import { Router } from "@paperbits/common/routing";
import { AzureBlobStorage } from "@paperbits/azure";
import * as Constants from "../constants";
import { MapiClient } from "./mapiClient";
import { KnownMimeTypes } from "../models/knownMimeTypes";
import { KnownHttpHeaders } from "../models/knownHttpHeaders";

export class ProvisionService {
    constructor(
        private readonly httpClient: HttpClient,
        private readonly mapiClient: MapiClient,
        private readonly authenticator: IAuthenticator,
        private readonly viewManager: ViewManager,
        private readonly router: Router,
        private readonly blobStorage: AzureBlobStorage
    ) { }

    private async fetchData(url: string): Promise<Object> {
        const response = await this.httpClient.send({ url: url, method: "GET" });
        return response.toObject();
    }

    public async provision(): Promise<void> {
        const dataUrl = `/editors/templates/default.json`;
        const dataObj = await this.fetchData(dataUrl);
        const keys = Object.keys(dataObj);
        const accessToken = await this.authenticator.getAccessTokenAsString();

        if (!accessToken) {
            this.viewManager.notifyError(`Unable to setup website`, `Management API access token is empty or invalid.`);
        }

        for (const key of keys) {
            const contentItem = dataObj[key];
            const url = `${key}?api-version=${Constants.managementApiVersion}`;
            await this.mapiClient.put(
                url,
                [
                    { name: KnownHttpHeaders.IfMatch, value: "*" },
                    { name: KnownHttpHeaders.ContentType, value: KnownMimeTypes.Json },
                    { name: KnownHttpHeaders.Authorization, value: accessToken },
                    await this.mapiClient.getPortalHeader("provision")
                ],
                contentItem);
        }
        this.router.navigateTo(Constants.pageUrlHome);
        this.viewManager.setHost({ name: "page-host" });
        this.viewManager.showToolboxes();
    }

    private async cleanupContent(): Promise<void> {
        const accessToken = await this.authenticator.getAccessTokenAsString();

        const response = await this.mapiClient.get(
            `contentTypes?api-version=${Constants.managementApiVersion}`,
            [
                { name: KnownHttpHeaders.IfMatch, value: "*" },
                { name: KnownHttpHeaders.ContentType, value: KnownMimeTypes.Json },
                { name: KnownHttpHeaders.Authorization, value: accessToken },
                await this.mapiClient.getPortalHeader("getContentTypes")
            ]);
        const contentTypes = Object.values(response["value"]);

        for (const contentType of contentTypes) {
            const contentTypeName = contentType["name"];
            const itemsResponse = await this.mapiClient.get(
                `contentTypes/${contentTypeName}/contentItems?api-version=${Constants.managementApiVersion}`,
                [
                    { name: KnownHttpHeaders.IfMatch, value: "*" },
                    { name: KnownHttpHeaders.ContentType, value: KnownMimeTypes.Json },
                    { name: KnownHttpHeaders.Authorization, value: accessToken },
                    await this.mapiClient.getPortalHeader("getContentItems")
                ]);

            const items = Object.values(itemsResponse["value"]);
            for (const item of items) {
                await this.mapiClient.delete(
                    `${item["id"]}?api-version=${Constants.managementApiVersion}`,
                    [
                        { name: KnownHttpHeaders.IfMatch, value: "*" },
                        { name: KnownHttpHeaders.ContentType, value: KnownMimeTypes.Json },
                        { name: KnownHttpHeaders.Authorization, value: accessToken },
                        await this.mapiClient.getPortalHeader("resetContent")
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