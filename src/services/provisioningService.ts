import { HttpClient, HttpRequest } from "@paperbits/common/http";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { IAuthenticator } from "../authentication";
import { ViewManager } from "@paperbits/common/ui";
import { Router } from "@paperbits/common/routing";
import { Utils } from "../utils";
import { AzureBlobStorage } from "@paperbits/azure";

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

    public async provision(): Promise<void> {
        // TODO: Move to config
        const settings = await this.settingsProvider.getSettings();
        let managementApiUrl = settings["managementApiUrl"];
        if (!managementApiUrl) {
            throw new Error(`Management API URL ("managementApiUrl") setting is missing in configuration file.`);
        }
        managementApiUrl = Utils.ensureUrlArmified(managementApiUrl);
        const managementApiVersion = settings["managementApiVersion"];

        if (!managementApiVersion) {
            throw new Error(`Management API version ("managementApiVersion") setting is missing in configuration file.`);
        }
        const dataUrl = `https://apimdeveloperportal.blob.core.windows.net/releases/201906201530/themes/default.json`;

        try {
            this.viewManager.removeShutter();
            const dataObj = await this.fetchData(dataUrl);
            const keys = Object.keys(dataObj);
            const accessToken = this.authenticator.getAccessToken();

            if (!accessToken) {
                this.viewManager.notifyError(`Unable to setup website`, `Management API access token is empty or invald.`);
            }

            for (const key of keys) {
                const contentItem = dataObj[key];
                const url = `${managementApiUrl}${Utils.ensureLeadingSlash(key)}?api-version=${managementApiVersion}`;

                const request: HttpRequest = {
                    url: url,
                    method: "PUT",
                    headers: [
                        { name: "If-Match", value: "*" },
                        { name: "Content-Type", value: "application/json" },
                        { name: "Authorization", value: accessToken }
                    ],
                    body: JSON.stringify(contentItem)
                };

                const response = await this.httpClient.send(request);

                if (response.statusCode >= 400) {
                    throw new Error("Unable to setup website.");
                }
            }
            this.router.navigateTo("/");
            this.viewManager.setHost({ name: "content-host" });
            this.viewManager.showToolboxes();
        }
        catch (error) {
            throw error;
        }
    }

    private async cleanupContent(): Promise<void> {
        const settings = await this.settingsProvider.getSettings();
        let managementApiUrl = settings["managementApiUrl"];
        if (!managementApiUrl) {
            throw new Error(`Management API URL ("managementApiUrl") setting is missing in configuration file.`);
        }
        managementApiUrl = Utils.ensureUrlArmified(managementApiUrl);
        const url = `${managementApiUrl}/contentTypes?api-version=2018-06-01-preview`;
        const accessToken = this.authenticator.getAccessToken();
        const request: HttpRequest = {
            url: url,
            method: "GET",
            headers: [
                { name: "If-Match", value: "*" },
                { name: "Content-Type", value: "application/json" },
                { name: "Authorization", value: accessToken }
            ],
        };
        const response = await this.sendRequest(request);
        //const contentTypes = response["values"].map(x => x.name);
        console.log(response["value"]);
        const contentTypes = Object.values(response["value"]);
        for (const contentType of contentTypes) {
            const contentTypeName = contentType["name"];
            console.log(contentTypeName);
            const curReq: HttpRequest = {
                url: `${managementApiUrl}/contentTypes/${contentTypeName}/contentItems?api-version=2018-06-01-preview`,
                method: "GET",
                headers: [
                    { name: "If-Match", value: "*" },
                    { name: "Content-Type", value: "application/json" },
                    { name: "Authorization", value: accessToken }
                ],
            };
            const itemsResponse = await this.sendRequest(curReq);
            console.log(itemsResponse);
            const items = Object.values(itemsResponse["value"]);
            for (const item of items) {
                console.log(item["id"]);
                const itemReq: HttpRequest = {
                    url: `${managementApiUrl}${item["id"]}?api-version=2018-06-01-preview`,
                    method: "DELETE", 
                    headers: [
                        { name: "If-Match", value: "*" },
                        { name: "Content-Type", value: "application/json" },
                        { name: "Authorization", value: accessToken }
                    ],
                };
                const response = await this.httpClient.send(itemReq);
                console.log(response);
            }
        } 
    }

    private async sendRequest(request: HttpRequest): Promise<Object> {
        const response = await this.httpClient.send(request);
        if (response.statusCode >= 400) {
            throw new Error("Unable to complete HttpRequest");
        }
        return response.toObject();
    }

    private async cleanupBlobs(): Promise<void> {
        const blobs = await this.blobStorage.listBlobs();
        for (const blob of blobs) {
            await this.blobStorage.deleteBlob(blob);
        }
    }

    public async cleanup(): Promise<void> {
        await this.cleanupBlobs();
        await this.cleanupContent();
    }
}