import * as ko from "knockout";
import * as Constants from "../../../../../constants";
import template from "./signin-aad.html";
import { Router } from "@paperbits/common/routing";
import { Component, RuntimeComponent, Param } from "@paperbits/common/ko/decorators";
import { AadService } from "../../../../../services";


@RuntimeComponent({
    selector: "signin-aad"
})
@Component({
    selector: "signin-aad",
    template: template,
    injectable: "signInAad"
})
export class SignInAad {
    public readonly errorMessages: ko.ObservableArray<string>;
    public readonly hasErrors: ko.Observable<boolean>;

    constructor(
        private readonly router: Router,
        private readonly aadService: AadService
    ) {
        this.clientId = ko.observable();
        this.errorMessages = ko.observableArray([]);
        this.hasErrors = ko.observable(false);
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
        }
        catch (error) {
            this.hasErrors(true);
            this.errorMessages([error.message]);
        }
    }
}