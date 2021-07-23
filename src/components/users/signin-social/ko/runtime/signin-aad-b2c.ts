import * as ko from "knockout";
import template from "./signin-aad-b2c.html";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { EventManager } from "@paperbits/common/events";
import { Component, OnMounted, Param, RuntimeComponent } from "@paperbits/common/ko/decorators";
import { SettingNames } from "../../../../../constants";
import { AadB2CClientConfig } from "../../../../../contracts/aadB2CClientConfig";
import { ValidationReport } from "../../../../../contracts/validationReport";
import { AadService } from "../../../../../services";


const aadb2cResetPasswordErrorCode = "AADB2C90118";

@RuntimeComponent({
    selector: "signin-aad-b2c"
})
@Component({
    selector: "signin-aad-b2c",
    template: template
})
export class SignInAadB2C {
    constructor(
        private readonly aadService: AadService,
        private readonly eventManager: EventManager,
        private readonly settingsProvider: ISettingsProvider
    ) {
        this.classNames = ko.observable();
        this.label = ko.observable();
        this.replyUrl = ko.observable();
    }

    @Param()
    public classNames: ko.Observable<string>;

    @Param()
    public label: ko.Observable<string>;

    @Param()
    public replyUrl: ko.Observable<string>;

    @OnMounted()
    public async initialize(): Promise<void> {
        await this.aadService.checkCallbacks();
    }

    /**
     * Initiates signing-in with Azure Active Directory B2C.
     */
    public async signIn(): Promise<void> {
        this.cleanValidationErrors();

        const config = await this.settingsProvider.getSetting<AadB2CClientConfig>(SettingNames.aadB2CClientConfig);

        try {
            await this.aadService.runAadB2CUserFlow(
                config.clientId,
                config.authority,
                config.signinTenant,
                config.signinPolicyName,
                this.replyUrl());
        }
        catch (error) {
            if (config.passwordResetPolicyName && error.message.includes(aadb2cResetPasswordErrorCode)) { // Reset password requested
                try {
                    await this.aadService.runAadB2CUserFlow(config.clientId, config.authority, config.signinTenant, config.passwordResetPolicyName);
                    return;
                }
                catch (resetpasswordError) {
                    error = resetpasswordError;
                }
            }

            let errorDetails: string[];

            if (error.code === "ValidationError") {
                errorDetails = error.details?.map(detail => detail.message);
            }
            else {
                errorDetails = [error.message];
            }

            const validationReport: ValidationReport = {
                source: "socialAcc",
                errors: errorDetails
            };

            this.eventManager.dispatchEvent("onValidationErrors", validationReport);
        }
    }

    private cleanValidationErrors(): void {
        const validationReport: ValidationReport = {
            source: "signInOAuth",
            errors: []
        };

        this.eventManager.dispatchEvent("onValidationErrors", validationReport);
    }
}
