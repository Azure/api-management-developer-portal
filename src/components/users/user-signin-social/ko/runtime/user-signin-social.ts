import * as ko from "knockout";
import * as Constants from "../../../../../constants";
import template from "./user-signin-social.html";
import { Router } from "@paperbits/common/routing";
import { Component, RuntimeComponent, OnMounted, Param } from "@paperbits/common/ko/decorators";
import { AadService } from "../../../../../services";


@RuntimeComponent({
    selector: "user-signin-social-runtime"
})
@Component({
    selector: "user-signin-social-runtime",
    template: template,
    injectable: "userSigninSocial"
})
export class UserSignInSocial {
    public readonly errorMessages: ko.ObservableArray<string>;
    public readonly hasErrors: ko.Observable<boolean>;

    constructor(
        private readonly router: Router,
        private readonly aadService: AadService
    ) {
        this.aadClientId = ko.observable();
        this.errorMessages = ko.observableArray([]);
        this.hasErrors = ko.observable(false);
    }

    @Param()
    public aadClientId: ko.Observable<string>;

    /**
     * Initiates signing-in with Azure Active Directory.
     */
    public async signInAad(): Promise<void> {
        const aadClientId = ko.unwrap(this.aadClientId());

        if (!aadClientId) {
            this.hasErrors(true);
            this.errorMessages([`AAD identity provider is not configured.`]);
            return;
        }

        try {
            await this.aadService.signIn(aadClientId);
            await this.router.navigateTo(Constants.homeUrl);
        }
        catch (error) {
            this.hasErrors(true);
            this.errorMessages([error.message]);
        }
    }

    /**
     * Initiates signing-out with Azure Active Directory.
     */
    public async signOutAad(): Promise<void> {
        await this.aadService.signOut();
        await this.router.navigateTo(Constants.homeUrl);
    }
}