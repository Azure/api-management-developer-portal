import * as ko from "knockout";
import * as Constants from "../../../../../constants";
import template from "./signin-aad-b2c.html";
import { Router } from "@paperbits/common/routing";
import { Component, RuntimeComponent, OnMounted, Param } from "@paperbits/common/ko/decorators";
import { AadService } from "../../../../../services";
import { EventManager } from "@paperbits/common/events";
import { ValidationReport } from "../../../../../contracts/validationReport";


@RuntimeComponent({
    selector: "signin-aad-b2c"
})
@Component({
    selector: "signin-aad-b2c",
    template: template,
    injectable: "signInAadB2C"
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
    }

    @Param()
    public clientId: ko.Observable<string>;

    @Param()
    public authority: ko.Observable<string>;

    @Param()
    public instance: ko.Observable<string>;

    @Param()
    public signInPolicy: ko.Observable<string>;

    @OnMounted()
    public async initialize(): Promise<void> {
        await this.aadService.checkCallbacks();
    }

    /**
     * Initiates signing-in with Azure Active Directory.
     */
    public async signIn(): Promise<void> {
        this.cleanValidationErrors();

        try {
            await this.aadService.signInWithAadB2C(this.clientId(), this.authority(), this.instance(), this.signInPolicy());
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