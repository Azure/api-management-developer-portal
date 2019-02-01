import * as ko from "knockout";
import * as validation from "knockout.validation";
import template from "./user-signup.html";
import { RuntimeComponent } from "@paperbits/common/ko/decorators";
import { Component } from "@paperbits/common/ko/decorators";
import { UsersService } from "../../../services/usersService";
import { TenantService } from "../../../services/tenantService";
import { TenantSettings } from "../../../contracts/tenantSettings";
import { SignupRequest } from "../../../contracts/signupRequest";
import { IRouteHandler } from "@paperbits/common/routing";

@RuntimeComponent({ selector: "user-signup" })
@Component({
    selector: "user-signup",
    template: template,
    injectable: "userSignup"
})
export class UserSignup {
    private tenantSettings: TenantSettings;
    public email: KnockoutObservable<string>;
    public userPassword: KnockoutObservable<string>;
    public userConfirmPassword: KnockoutObservable<string>;
    public firstName: KnockoutObservable<string>;
    public lastName: KnockoutObservable<string>;
    public isUserRequested: KnockoutObservable<boolean>;
    public isUserLoggedIn: KnockoutObservable<boolean>;

    public isTermsRequired: KnockoutObservable<boolean>;
    public termsOfUse: KnockoutObservable<string>;
    public showTerms: KnockoutObservable<boolean>;
    public isAgreed: KnockoutObservable<boolean>;
    public showHideLabel: KnockoutObservable<string>;
    public serverErrors: KnockoutObservable<string>;

    constructor(
        private readonly usersService: UsersService,
        private readonly tenantService: TenantService,
        private readonly routeHandler: IRouteHandler) {

        this.email = ko.observable("").extend({ required: true, email: true });
        this.userPassword = ko.observable("").extend({ required: true, minLength: 8 });
        this.userConfirmPassword = ko.observable("").extend({ required: true, minLength: 8, equal: { message: "Must be equal to Password", params: this.userPassword } });
        this.firstName = ko.observable("").extend({ required: true });
        this.lastName = ko.observable("").extend({ required: true });

        this.isTermsRequired = ko.observable();
        this.showTerms = ko.observable();
        this.termsOfUse = ko.observable();
        this.showHideLabel = ko.observable();
        this.serverErrors = ko.observable();
        this.isUserRequested = ko.observable(false);
        this.isUserLoggedIn = ko.observable(false);

        this.signupClick = this.signupClick.bind(this);
        this.init();
    }

    private async init() {
        if (this.usersService.isUserLoggedIn()) {
            this.isUserLoggedIn(true);
            return;
        }
        // const settings = await this.tenantService.getSettings();
        const settings = {
            userRegistrationTerms: "Test userRegistrationTerms!!!",
            userRegistrationTermsEnabled: false,
            userRegistrationTermsConsentRequired: false
        };
        this.tenantSettings = settings as TenantSettings;

        if (this.tenantSettings && this.tenantSettings.userRegistrationTermsEnabled) {
            this.isAgreed = ko.observable(false).extend({ equal: { params: true, message: "You must agree before submitting." } });
            this.termsOfUse(settings.userRegistrationTerms);
            this.showHideLabel("Show");
            this.isTermsRequired(settings.userRegistrationTermsConsentRequired);
        }

        validation.init({
            insertMessages: false,
            errorElementClass: "is-invalid",
            decorateInputElement: true
        });
    }

    public navigateToHome() {
        location.assign("/");
    }

    public login() {
        location.assign("/signin");
    }

    public async signupClick() {
        this.serverErrors(null);
        const result = validation.group(this);
        if (result().length !== 0) {
            result.showAllMessages();
            return;
        }

        const createSignupRequest: SignupRequest = {
            email: this.email(),
            firstName: this.firstName(),
            lastName: this.lastName(),
            // providerName: "Basic",
            // nameIdentifier: undefined,
            password: this.userPassword(),
            confirmation: "signup",
        }

        try {
            await this.usersService.createSignupRequest(createSignupRequest);
            this.isUserRequested(true);
        } catch (error) {
            if (error.code === "ValidationError") {
                const details: any[] = error.details;
                if (details && details.length > 0) {
                    let message = "";
                    details.map(item => message = `${message}${item.target}: ${item.message} \n`);
                    this.serverErrors(message);
                }
            }
        }

    }

    public canSignup(): boolean {
        return ((this.termsOfUse() && this.isTermsRequired() && this.isAgreed()) || !this.isTermsRequired() || !!!this.termsOfUse());
    }

    public toggle() {
        if (this.showTerms()) {
            this.showHideLabel("Show");
        } else {
            this.showHideLabel("Hide");
        }
        this.showTerms(!this.showTerms());
    }
}