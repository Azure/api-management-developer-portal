import { AzureResourceManagementService } from "./../../services/armService";
import { SessionManager } from "./../../authentication/sessionManager";
import { KnownHttpHeaders } from "./../../models/knownHttpHeaders";
import { HttpClient } from "@paperbits/common/http";
import { AccessToken } from "./../../authentication/accessToken";
import template from "./app.html";
import { ViewManager } from "@paperbits/common/ui";
import { Component, OnMounted } from "@paperbits/common/ko/decorators";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { ISiteService } from "@paperbits/common/sites";
import { IAuthenticator } from "../../authentication";
import { Utils } from "../../utils";
import { Bag } from "@paperbits/common";

const startupError = `Unable to start the portal`;

@Component({
    selector: "app",
    template: template
})
export class App {
    constructor(
        private readonly settingsProvider: ISettingsProvider,
        private readonly authenticator: IAuthenticator,
        private readonly viewManager: ViewManager,
        private readonly siteService: ISiteService,
        private readonly armService: AzureResourceManagementService,
        private readonly sessionManager: SessionManager
    ) { }

    private async getRuntimeSettings(): Promise<Bag<string>> {
        const serviceDescription = await this.armService.getServiceDescription();

        const userId = "1";
        const userTokenValue = await this.armService.getUserAccessToken(userId);

        return {
            managementApiUrl: serviceDescription.properties.managementApiUrl,
            managementApiAccessToken: userTokenValue
        };
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        const settings = await this.settingsProvider.getSettings();

        // TODO: Make ARM -switch
        const azureManagementApiUrl = settings["azureManagementApiUrl"];

        if (azureManagementApiUrl) {
            const runtimeSettings = await this.getRuntimeSettings();
            this.sessionManager.setItem("designTimeSettings", runtimeSettings);

            this.viewManager.setHost({ name: "page-host" });
            this.viewManager.showToolboxes();

            return;
        }

        if (!settings["managementApiUrl"]) {
            this.viewManager.addToast(startupError, `Management API URL is missing. See setting <i>managementApiUrl</i> in the configuration file <i>config.design.json</i>`);
            return;
        }

        try {
            const token = await this.authenticator.getAccessToken();

            if (!token) {
                const managementApiAccessToken = settings["managementApiAccessToken"];

                if (!managementApiAccessToken) {
                    this.viewManager.addToast(startupError, `Management API access token is missing. See setting <i>managementApiAccessToken</i> in the configuration file <i>config.design.json</i>`);
                    return;
                }

                const accessToken = AccessToken.parse(managementApiAccessToken);
                const utcNow = Utils.getUtcDateTime();

                if (utcNow >= accessToken.expires) {
                    this.viewManager.addToast(startupError, `Management API access token has expired. See setting <i>managementApiAccessToken</i> in the configuration file <i>config.design.json</i>`);
                    this.authenticator.clearAccessToken();
                    window.location.assign("/signout");
                    return;
                }

                await this.authenticator.setAccessToken(accessToken);
            }
        }
        catch (error) {
            this.viewManager.addToast(startupError, error);
            return;
        }

        try {
            /* Checking if settings were created, and if not, we consider the portal not initialized and launch setup dialog. */

            const siteSettings = await this.siteService.getSettings<any>();

            if (!siteSettings) {
                this.viewManager.setHost({ name: "setup-dialog" });
                return;
            }

            this.viewManager.setHost({ name: "page-host" });
            this.viewManager.showToolboxes();
        }
        catch (error) {
            this.viewManager.addToast(startupError, `Check if the settings specified in the configuration file <i>config.design.json</i> are correct or refer to the <a href="http://aka.ms/apimdocs/portal#faq" target="_blank">frequently asked questions</a>.`);
        }
    }
}