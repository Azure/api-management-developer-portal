import * as ko from "knockout";
import * as Constants from "../../../../../constants";
import template from "./signin-aad.html";
import { Router } from "@paperbits/common/routing";
import { Component, RuntimeComponent, Param } from "@paperbits/common/ko/decorators";
import { AadService } from "../../../../../services";
import { EventManager } from "@paperbits/common/events";
import { ValidationReport } from "../../../../../contracts/validationReport";


@RuntimeComponent({
    selector: "signin-aad"
})
@Component({
    selector: "signin-aad",
    template: template,
    injectable: "signInAad"
})
export class SignInAad {
    constructor(
        private readonly aadService: AadService,
        private readonly eventManager: EventManager
    ) {
        this.clientId = ko.observable();
        this.signinTenant = ko.observable();
    }

    @Param()
    public clientId: ko.Observable<string>;

    @Param()
    public signinTenant: ko.Observable<string>;

    /**
     * Initiates signing-in with Azure Active Directory.
     */
    public async signIn(): Promise<void> {
        this.cleanValidationErrors();

        try {
            await this.aadService.signInWithAad(this.clientId(), this.signinTenant());
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