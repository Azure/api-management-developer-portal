import * as ko from "knockout";
import * as Constants from "../../../../../constants";
import template from "./signin-aad.html";
import { Router } from "@paperbits/common/routing";
import { Component, RuntimeComponent, Param } from "@paperbits/common/ko/decorators";
import { AadService } from "../../../../../services";
import { IEventManager } from "@paperbits/common/events/IEventManager";


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
        private readonly router: Router,
        private readonly aadService: AadService,
        private readonly eventManager: IEventManager
    ) {
        this.clientId = ko.observable();
    }

    @Param()
    public clientId: ko.Observable<string>;

    /**
     * Initiates signing-in with Azure Active Directory.
     */
    public async signIn(): Promise<void> {
        try {
            await this.aadService.signInWithAad(this.clientId());
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