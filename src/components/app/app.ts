import { EventManager } from "@paperbits/common/events";
import template from "./app.html";
import { ViewManager } from "@paperbits/common/ui";
import { Component, OnMounted } from "@paperbits/common/ko/decorators";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { ISiteService } from "@paperbits/common/sites";
import { IAuthenticator } from "../../authentication";
import { DeveloperPortalType, SettingNames, WarningBackendUrlMissing } from "../../constants";
import { ArmService } from "../../services/armService";
import { Logger } from "@paperbits/common/logging/logger";

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
        private readonly eventManager: EventManager,
        private readonly siteService: ISiteService,
        private readonly armService: ArmService,
        private readonly logger: Logger
    ) { }

    @OnMounted()
    public async initialize(): Promise<void> {
        await this.armService.loadSessionSettings(this.settingsProvider);

        const settings = await this.settingsProvider.getSettings();
        const developerPortalType = settings[SettingNames.developerPortalType] || DeveloperPortalType.selfHosted;

        if (!settings[SettingNames.dataApiUrl] && !settings[SettingNames.backendUrl]) {
            if (developerPortalType === DeveloperPortalType.selfHosted) {
                const toast = this.viewManager.notifyInfo("Settings", WarningBackendUrlMissing, [{
                    title: "Got it",
                    action: async () => this.viewManager.removeToast(toast)
                }]);
            }
        }

        if (!settings[SettingNames.managementApiUrl]) {
            this.viewManager.addToast(startupError, `Please check required service settings (like subscription, resource group, service name) in the configuration file <i>config.design.json</i>`);
            return;
        }

        const token = await this.authenticator.getAccessToken();
        if (!token) {
            this.viewManager.addToast(startupError, `ARM access token is missing. Please restart editor to reauthenticate.`);
            return;
        }

        if (token.isExpired()) {
            this.viewManager.addToast(startupError, `ARM access token has expired. Please restart editor to reauthenticate.`);
            this.authenticator.clearAccessToken();
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

            setTimeout(() => this.eventManager.dispatchEvent("displayHint", {
                key: "a69b",
                content: `When you're in the administrative view, you still can navigate any website hyperlink by clicking on it holding Ctrl (Windows) or ⌘ (Mac) key.`
            }), 5000);
        }
        catch (error) {
            this.logger.trackError(error, { message: "Error in app initialize while resolving settings" } );
            this.viewManager.addToast(startupError, `Check if the settings specified in the configuration file <i>config.design.json</i> are correct or refer to the <a href="http://aka.ms/apimdocs/portal#faq" target="_blank">frequently asked questions</a>.`);
        }
    }
}