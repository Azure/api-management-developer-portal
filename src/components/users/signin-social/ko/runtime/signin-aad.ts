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
        this.signinTenant = ko.observable();
        this.classNames = ko.observable();
        this.label = ko.observable();
    }

    @Param()
    public clientId: ko.Observable<string>;

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
            await this.aadService.signInWithAadAdal(this.clientId(), this.signinTenant());
        }
        catch (error) {
            const validationReport: ValidationReport = {
                source: "socialAcc",
                errors: [error.message]
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