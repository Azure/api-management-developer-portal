import * as ko from "knockout";
import * as validation from "knockout.validation";
import template from "./user-signup.html";
import { Component, RuntimeComponent, OnMounted } from "@paperbits/common/ko/decorators";
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
    public email: ko.Observable<string>;
    public userPassword: ko.Observable<string>;
    public userConfirmPassword: ko.Observable<string>;
    public firstName: ko.Observable<string>;
    public lastName: ko.Observable<string>;
    public isUserRequested: ko.Observable<boolean>;
    public isUserLoggedIn: ko.Observable<boolean>;
    public isTermsRequired: ko.Observable<boolean>;
    public termsOfUse: ko.Observable<string>;
    public showTerms: ko.Observable<boolean>;
    public isAgreed: ko.Observable<boolean>;
    public showHideLabel: ko.Observable<string>;
    public serverErrors: ko.Observable<string>;
    public working: ko.Observable<boolean>;

    constructor(
        private readonly usersService: UsersService,
        private readonly tenantService: TenantService,
        private readonly routeHandler: IRouteHandler) {

        this.email = ko.observable("");
        this.userPassword = ko.observable("");
        this.userConfirmPassword = ko.observable("");
        this.firstName = ko.observable("");
        this.lastName = ko.observable("");
        this.isTermsRequired = ko.observable();
        this.showTerms = ko.observable();
        this.termsOfUse = ko.observable();
        this.showHideLabel = ko.observable();
        this.serverErrors = ko.observable();
        this.isUserRequested = ko.observable(false);
        this.isUserLoggedIn = ko.observable(false);
        this.working = ko.observable(false);
    }

    @OnMounted()
    public async init() {
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
            this.isAgreed = (<any>ko.observable(false)).extend({ equal: { params: true, message: "You must agree before submitting." } });
            this.termsOfUse(settings.userRegistrationTerms);
            this.showHideLabel("Show");
            this.isTermsRequired(settings.userRegistrationTermsConsentRequired);
        }

        validation.init({
            insertMessages: false,
            errorElementClass: "is-invalid",
            decorateInputElement: true
        });

        this.email.extend(<any>{ required: true, email: true });
        this.userPassword.extend(<any>{ required: true, minLength: 8 });
        this.userConfirmPassword.extend(<any>{ required: true, minLength: 8, equal: { message: "Must be equal to Password", params: this.userPassword } });
        this.firstName.extend(<any>{ required: true });
        this.lastName.extend(<any>{ required: true });
    }

    public navigateToHome(): void {
        location.assign("/");
    }

    public login(): void {
        location.assign("/signin");
    }

    public async signup(): Promise<void> {
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
        };

        try {
            await this.usersService.createSignupRequest(createSignupRequest);
            this.isUserRequested(true);
        }
        catch (error) {
            if (error.code === "ValidationError") {
                const details: any[] = error.details;

                if (details && details.length > 0) {
                    let message = "";
                    details.map(item => message = `${message}${item.target}: ${item.message} \n`);
                    this.serverErrors(message);
                }
            }
            else {
                throw new Error(error);
            }
        }
    }

    public canSignup(): boolean {
        return ((this.termsOfUse() && this.isTermsRequired() && this.isAgreed()) || !this.isTermsRequired() || !!!this.termsOfUse());
    }

    public toggle(): void {
        if (this.showTerms()) {
            this.showHideLabel("Show");
        }
        else {
            this.showHideLabel("Hide");
        }
        this.showTerms(!this.showTerms());
    }
}