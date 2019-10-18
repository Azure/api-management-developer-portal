import * as ko from "knockout";
import * as Constants from "../../../../../constants";
import template from "./signin-aad-b2c.html";
import { Router } from "@paperbits/common/routing";
import { Component, RuntimeComponent, OnMounted, Param } from "@paperbits/common/ko/decorators";
import { AadService } from "../../../../../services";
import { IEventManager } from "@paperbits/common/events/IEventManager";


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
        private readonly router: Router,
        private readonly aadService: AadService,
        private readonly eventManager: IEventManager
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
        try {
            await this.aadService.signInWithAadB2C(this.clientId(), this.authority(), this.instance(), this.signInPolicy());
            await this.router.navigateTo(Constants.homeUrl);
            const event = new CustomEvent("validationsummary", {detail: {msgs: [], from: "socialAcc"}});
            this.eventManager.dispatchEvent("validationsummary", event);
        }
        catch (error) {
            const event = new CustomEvent("validationsummary", {detail: {msgs: [error.message], from: "socialAcc"}});
            this.eventManager.dispatchEvent("validationsummary", event);
        }
    }
}