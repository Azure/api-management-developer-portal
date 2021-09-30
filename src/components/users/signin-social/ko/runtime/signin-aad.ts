import * as ko from "knockout";
import template from "./signin-aad.html";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { EventManager } from "@paperbits/common/events";
import { Component, Param, RuntimeComponent } from "@paperbits/common/ko/decorators";
import { ValidationReport } from "../../../../../contracts/validationReport";
import { AadService } from "../../../../../services";
import { SettingNames, defaultAadTenantName } from "./../../../../../constants";
import { AadClientConfig } from "./../../../../../contracts/aadClientConfig";



@RuntimeComponent({
    selector: "signin-aad"
})
@Component({
    selector: "signin-aad",
    template: template
})
export class SignInAad {
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


    /**
     * Initiates signing-in with Azure Active Directory.
     */
    public async signIn(): Promise<void> {
        this.cleanValidationErrors();

        try {
            const config = await this.settingsProvider.getSetting<AadClientConfig>(SettingNames.aadClientConfig);
            await this.aadService.signInWithAad(config.clientId, config.authority, config.signinTenant || defaultAadTenantName, this.replyUrl());
        }
        catch (error) {
            let errorDetails;

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