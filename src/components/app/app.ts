import { ISettingsProvider } from "@paperbits/common/configuration";
import { EventManager } from "@paperbits/common/events";
import { Component, OnMounted } from "@paperbits/common/ko/decorators";
import { Logger } from "@paperbits/common/logging/logger";
import { SessionManager } from "@paperbits/common/persistence/sessionManager";
import { ISiteService } from "@paperbits/common/sites";
import { ViewManager } from "@paperbits/common/ui";
import { IAuthenticator } from "../../authentication";
import { DeveloperPortalType, SettingNames, WarningBackendUrlMissing } from "../../constants";
import { AzureResourceManagementService } from "../../services/armService";
import { AccessToken } from "./../../authentication/accessToken";
import template from "./app.html";

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
        private readonly logger: Logger
    ) { }

    @OnMounted()
    public async initialize(): Promise<void> {
        try {
            const settings = await this.settingsProvider.getSettings();
            const accessToken = await this.authenticator.getAccessTokenAsString();

            if (!accessToken) {
                const managementApiAccessToken = settings[SettingNames.managementApiAccessToken];

                if (!managementApiAccessToken) {
                    this.viewManager.addToast(startupError, `Management API access token is missing. See setting <i>managementApiAccessToken</i> in the configuration file <i>config.design.json</i>`);
                    return;
                }

                const accessToken = AccessToken.parse(managementApiAccessToken);
                const now = new Date();

                if (now >= accessToken.expires) {
                    this.viewManager.addToast(startupError, `Management API access token has expired. See setting <i>managementApiAccessToken</i> in the configuration file <i>config.design.json</i>`);
                    this.authenticator.clearAccessToken();
                    return;
                }

                await this.authenticator.setAccessToken(accessToken);
            }
        }
        catch (error) {
            this.logger.trackError(error, { message: "Error in app initialize for getting a token" });
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

            setTimeout(() => this.eventManager.dispatchEvent("displayHint", {
                key: "a69b",
                content: `When you're in the administrative view, you still can navigate any website hyperlink by clicking on it holding Ctrl (Windows) or ⌘ (Mac) key.`
            }), 5000);
        }
        catch (error) {
            this.logger.trackError(error, { message: "Error in app initialize while resolving settings" });
            this.viewManager.addToast(startupError, `Check if the settings specified in the configuration file <i>config.design.json</i> are correct or refer to the <a href="http://aka.ms/apimdocs/portal#faq" target="_blank">frequently asked questions</a>.`);
        }
    }
}