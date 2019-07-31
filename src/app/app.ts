import template from "./app.html";
import { IViewManager } from "@paperbits/common/ui";
import { Component, OnMounted } from "@paperbits/common/ko/decorators";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { ISiteService } from "@paperbits/common/sites";
import { IAuthenticator } from "../authentication";

const startupError = `Unable to start the portal`;

@Component({
    selector: "app",
    template: template,
    injectable: "app"
})
export class App {
    constructor(
        private readonly settingsProvider: ISettingsProvider,
        private readonly authenticator: IAuthenticator,
        private readonly viewManager: IViewManager,
        private readonly siteService: ISiteService
    ) { }

    @OnMounted()
    public async initialize(): Promise<void> {
        const settings = await this.settingsProvider.getSettings();
        const managementApiAccessToken = settings["managementApiAccessToken"];

        if (!settings["managementApiUrl"]) {
            this.viewManager.addToast(startupError, `Management API URL is missing. See setting <i>managementApiUrl</i> in the configuration file <i>config.design.json</i>`);
            return;
        }

        if (!settings["managementApiVersion"]) {
            this.viewManager.addToast(startupError, `Management API version is missing. See setting <i>managementApiVersion</i> in the configuration file <i>config.design.json</i>`);
            return;
        }

        try {
            const accessToken = this.authenticator.parseAccessToken(managementApiAccessToken);
            const now = new Date();

            if (now >= accessToken.expires) {
                this.viewManager.addToast(startupError, `Management API access token has expired. See setting <i>managementApiAccessToken</i> in the configuration file <i>config.design.json</i>`);
                return;
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
    
            this.viewManager.setHost({ name: "content-host" });
            this.viewManager.showToolboxes();
        }
        catch (error) {
            this.viewManager.addToast(startupError, `See if settings are specified correctly in the configuration file <i>config.design.json</i>`);
        }
    }
}