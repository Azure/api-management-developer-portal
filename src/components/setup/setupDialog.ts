import template from "./setupDialog.html";
import { HttpClient, HttpRequest } from "@paperbits/common/http";
import { Component, OnMounted } from "@paperbits/common/ko/decorators";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { Utils } from "../../utils";
import { IAuthenticator } from "../../authentication/IAuthenticator";
import { IViewManager } from "@paperbits/common/ui";
import { Router } from "@paperbits/common/routing";

@Component({
    selector: "setup-dialog",
    template: template,
    injectable: "setupDialog"
})
export class SetupDialog {
    private managementApiUrl: string;
    private managementApiVersion: string;

    constructor(
        private readonly httpClient: HttpClient,
        private readonly settingsProvider: ISettingsProvider,
        private readonly authenticator: IAuthenticator,
        private readonly viewManager: IViewManager,
        private readonly router: Router
    ) { }

    @OnMounted()
    public async initialize(): Promise<void> {
        const settings = await this.settingsProvider.getSettings();

        const managementApiUrl = settings["managementApiUrl"];

        if (!managementApiUrl) {
            throw new Error(`Management API URL ("managementApiUrl") setting is missing in configuration file.`);
        }

        this.managementApiUrl = Utils.ensureUrlArmified(managementApiUrl);

        const managementApiVersion = settings["managementApiVersion"];

        if (!managementApiVersion) {
            throw new Error(`Management API version ("managementApiVersion") setting is missing in configuration file.`);
        }

        this.managementApiVersion = managementApiVersion;

        try {
            this.viewManager.removeShutter();
            await this.provision();
            this.router.navigateTo("/");
            this.viewManager.setHost({ name: "content-host" });
            this.viewManager.showToolboxes();
        }
        catch (error) {
            console.error(error);
        }
    }

    private async fetchData(url: string): Promise<Object> {
        const response = await this.httpClient.send({ url: url, method: "GET" });
        return response.toObject();
    }

    private async provision(): Promise<void> {
        // TODO: Move to config
        const dataUrl = `https://apimdeveloperportal.blob.core.windows.net/releases/201906201530/themes/default.json`;
        const dataObj = await this.fetchData(dataUrl);
        const keys = Object.keys(dataObj);
        const accessToken = this.authenticator.getAccessToken();

        if (!accessToken) {
            this.viewManager.notifyError(`Unable to setup website`, `Management API access token is empty or invald.`);
        }

        for (const key of keys) {
            const contentItem = dataObj[key];
            const url = `${this.managementApiUrl}${Utils.ensureLeadingSlash(key)}?api-version=${this.managementApiVersion}`;

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
    }
}