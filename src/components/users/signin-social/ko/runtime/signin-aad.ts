import * as ko from "knockout";
import template from "./signin-aad.html";
import { EventManager } from "@paperbits/common/events";
import { Component, RuntimeComponent, Param } from "@paperbits/common/ko/decorators";
import { ValidationReport } from "../../../../../contracts/validationReport";
import { AadService } from "../../../../../services";


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
        private readonly eventManager: EventManager
    ) {
        this.clientId = ko.observable();
        this.authority = ko.observable();
        this.signinTenant = ko.observable();
        this.classNames = ko.observable();
        this.label = ko.observable();
    }

    @Param()
    public clientId: ko.Observable<string>;

    @Param()
    public authority: ko.Observable<string>;

    @Param()
    public signinTenant: ko.Observable<string>;

    @Param()
    public classNames: ko.Observable<string>;

    @Param()
    public label: ko.Observable<string>;

    /**
     * Initiates signing-in with Azure Active Directory.
     */
    public async signIn(): Promise<void> {
        this.cleanValidationErrors();

        try {
            await this.aadService.signInWithAadAdal(this.clientId(), this.authority(), this.signinTenant());
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