import template from "./app.html";
import { ViewManager } from "@paperbits/common/ui";
import { Component, OnMounted } from "@paperbits/common/ko/decorators";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { ISiteService } from "@paperbits/common/sites";
import { IAuthenticator } from "../../authentication";

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
        private readonly siteService: ISiteService
    ) { }

    @OnMounted()
    public async initialize(): Promise<void> {
        const settings = await this.settingsProvider.getSettings();

        if (!settings["managementApiUrl"]) {
            this.viewManager.addToast(startupError, `Management API URL is missing. See setting <i>managementApiUrl</i> in the configuration file <i>config.design.json</i>`);
            return;
        }

        if (!settings["managementApiVersion"]) {
            this.viewManager.addToast(startupError, `Management API version is missing. See setting <i>managementApiVersion</i> in the configuration file <i>config.design.json</i>`);
            return;
        }

        try {
            const token = await this.authenticator.getAccessToken();

            if (!token) {
                const managementApiAccessToken = settings["managementApiAccessToken"];
                const accessToken = this.authenticator.parseAccessToken(managementApiAccessToken);
                const now = new Date();

                if (now >= accessToken.expires) {
                    this.viewManager.addToast(startupError, `Management API access token has expired. See setting <i>managementApiAccessToken</i> in the configuration file <i>config.design.json</i>`);
                    return;
                }

                await this.authenticator.setAccessToken(accessToken.value);
            }
        }
        catch (error) {
            this.viewManager.addToast(startupError, error);
            return;
        }

        try {
            /* Checking if settings were created, and if not, we consider the portal not initialized and launch setup dialog. */

            const siteSettings = await this.siteService.getSiteSettings();

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