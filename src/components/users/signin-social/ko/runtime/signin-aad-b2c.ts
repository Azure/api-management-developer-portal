import * as ko from "knockout";
import template from "./signin-aad-b2c.html";
import { Component, RuntimeComponent, OnMounted, Param } from "@paperbits/common/ko/decorators";
import { EventManager } from "@paperbits/common/events";
import { AadService } from "../../../../../services";
import { ValidationReport } from "../../../../../contracts/validationReport";


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
        private readonly eventManager: EventManager
    ) {
        this.clientId = ko.observable();
        this.authority = ko.observable();
        this.instance = ko.observable();
        this.signInPolicy = ko.observable();
        this.passwordResetPolicyName = ko.observable();
        this.classNames = ko.observable();
        this.label = ko.observable();
    }

    @Param()
    public clientId: ko.Observable<string>;

    @Param()
    public authority: ko.Observable<string>;

    @Param()
    public instance: ko.Observable<string>;

    @Param()
    public signInPolicy: ko.Observable<string>;

    @Param()
    public passwordResetPolicyName: ko.Observable<string>;

    @Param()
    public classNames: ko.Observable<string>;

    @Param()
    public label: ko.Observable<string>;

    @OnMounted()
    public async initialize(): Promise<void> {
        await this.aadService.checkCallbacks();
    }

    /**
     * Initiates signing-in with Azure Active Directory B2C.
     */
    public async signIn(): Promise<void> {
        this.cleanValidationErrors();

        try {
            await this.aadService.runAadB2CUserFlow(this.clientId(), this.authority(), this.instance(), this.signInPolicy());
        }
        catch (error) {
            if (this.passwordResetPolicyName() && error.message.includes(aadb2cResetPasswordErrorCode)) { // Reset password requested
                try {
                    await this.aadService.runAadB2CUserFlow(this.clientId(), this.authority(), this.instance(), this.passwordResetPolicyName());
                    return;
                }
                catch (resetpasswordError) {
                    error = resetpasswordError;
                }
            }

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