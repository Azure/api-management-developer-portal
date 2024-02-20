import * as ko from "knockout";
import template from "./signin-aad-b2c.html";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { EventManager } from "@paperbits/common/events";
import { Component, OnMounted, Param, RuntimeComponent } from "@paperbits/common/ko/decorators";
import { AadClientLibrary, SettingNames } from "../../../../../constants";
import { AadB2CClientConfig } from "../../../../../contracts/aadB2CClientConfig";
import { AadService, AadServiceV2, IAadService } from "../../../../../services";
import { dispatchErrors, parseAndDispatchError } from "../../../validation-summary/utils";
import { ErrorSources } from "../../../validation-summary/constants";
import { Logger } from "@paperbits/common/logging";
import { eventTypes } from "../../../../../logging/clientLogger";


const aadb2cResetPasswordErrorCode = "AADB2C90118";

@RuntimeComponent({
    selector: "signin-aad-b2c"
})
@Component({
    selector: "signin-aad-b2c",
    template: template
})
export class SignInAadB2C {
    private selectedService: IAadService;
    private aadConfig: AadB2CClientConfig;

    constructor(
        private readonly aadService: AadService,
        private readonly aadServiceV2: AadServiceV2,
        private readonly eventManager: EventManager,
        private readonly settingsProvider: ISettingsProvider,
        private readonly logger: Logger
    ) {
        this.classNames = ko.observable();
        this.label = ko.observable();
        this.replyUrl = ko.observable();
        // Is necessary for displaying Terms of Use. Will be called when the back-end implementation is done 
        this.termsOfUse = ko.observable();
    }

    @Param()
    public classNames: ko.Observable<string>;

    @Param()
    public label: ko.Observable<string>;

    @Param()
    public replyUrl: ko.Observable<string>;

    @Param()
    public termsOfUse: ko.Observable<string>;

    @OnMounted()
    public async initialize(): Promise<void> {
        this.aadConfig = await this.settingsProvider.getSetting<AadB2CClientConfig>(SettingNames.aadB2CClientConfig);

        if (this.aadConfig) {
            if (this.aadConfig.clientLibrary === AadClientLibrary.v2) {
                this.selectedService = this.aadServiceV2;
            } else {
                this.selectedService = this.aadService;
            }
            await this.selectedService.checkCallbacks();
        }
        else {
            this.logger.trackEvent(eventTypes.aadB2CLogin, { message: "AAD B2C client configuration is missing." });
        }

        this.logger.trackEvent(eventTypes.aadB2CLogin, { message: "Signin AAD B2C component initialized." });
    }

    /**
     * Initiates signing-in with Azure Active Directory B2C.
     */
    public async signIn(): Promise<void> {
        this.logger.trackEvent(eventTypes.aadB2CLogin, { message: "Login initiated." });
        this.cleanValidationErrors();

        if (!this.aadConfig) {
            this.logger.trackEvent(eventTypes.aadB2CLogin, { message: "AAD B2C client configuration is missing." })
            return;
        }

        try {
            await this.selectedService.runAadB2CUserFlow(
                this.aadConfig.clientId,
                this.aadConfig.authority,
                this.aadConfig.signinTenant,
                this.aadConfig.signinPolicyName,
                this.replyUrl());
        }
        catch (error) {
            if (this.aadConfig.passwordResetPolicyName && error.message.includes(aadb2cResetPasswordErrorCode)) { // Reset password requested
                try {
                    await this.selectedService.runAadB2CUserFlow(this.aadConfig.clientId, this.aadConfig.authority, this.aadConfig.signinTenant, this.aadConfig.passwordResetPolicyName);
                    return;
                }
                catch (resetpasswordError) {
                    error = resetpasswordError;
                }
            }

            parseAndDispatchError(this.eventManager, ErrorSources.signInOAuth, error, this.logger);
        }
    }

    private cleanValidationErrors(): void {
        dispatchErrors(this.eventManager, ErrorSources.signInOAuth, []);
    }
}
