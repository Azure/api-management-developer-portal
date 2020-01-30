import * as ko from "knockout";
import template from "./signin-aad-b2c.html";
import { Component, RuntimeComponent, OnMounted, Param } from "@paperbits/common/ko/decorators";
import { EventManager } from "@paperbits/common/events";
import { AadService } from "../../../../../services";
import { ValidationReport } from "../../../../../contracts/validationReport";


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
    public classNames: ko.Observable<string>;

    @Param()
    public label: ko.Observable<string>;

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