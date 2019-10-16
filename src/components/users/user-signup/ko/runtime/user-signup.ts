import * as ko from "knockout";
import * as validation from "knockout.validation";
import template from "./user-signup.html";
import { Component, RuntimeComponent, OnMounted, Param } from "@paperbits/common/ko/decorators";
import { CaptchaService } from "../../../../../services/captchaService";
import { UsersService } from "../../../../../services/usersService";
import { TenantSettings } from "../../../../../contracts/tenantSettings";
import { SignupRequest } from "../../../../../contracts/signupRequest";

declare var WLSPHIP0;

@RuntimeComponent({ selector: "user-signup" })
@Component({
    selector: "user-signup",
    template: template,
    injectable: "userSignup"
})
export class UserSignup {
    private tenantSettings: TenantSettings;

    public readonly email: ko.Observable<string>;
    public readonly password: ko.Observable<string>;
    public readonly passwordConfirmation: ko.Observable<string>;
    public readonly firstName: ko.Observable<string>;
    public readonly lastName: ko.Observable<string>;
    public readonly isUserRequested: ko.Observable<boolean>;
    public readonly isConsentRequired: ko.Observable<boolean>;
    public readonly termsOfUse: ko.Observable<string>;
    public readonly showTerms: ko.Observable<boolean>;
    public readonly consented: ko.Observable<boolean>;
    public readonly showHideLabel: ko.Observable<string>;
    public readonly errorMessages: ko.ObservableArray<string>;
    public readonly working: ko.Observable<boolean>;
    public readonly hasErrors: ko.Computed<boolean>;
    public readonly captcha: ko.Observable<string>;

    constructor(
        private readonly usersService: UsersService,       
        private readonly captchaService: CaptchaService) {            
        this.email = ko.observable("");
        this.password = ko.observable("");
        this.passwordConfirmation = ko.observable("");
        this.firstName = ko.observable("");
        this.lastName = ko.observable("");
        this.isConsentRequired = ko.observable();
        this.consented = ko.observable(false);
        this.showTerms = ko.observable();
        this.termsOfUse = ko.observable();
        this.showHideLabel = ko.observable();
        this.errorMessages = ko.observableArray([]);
        this.isUserRequested = ko.observable(false);
        this.working = ko.observable(false);
        this.hasErrors = ko.pureComputed(() => this.errorMessages().length > 0);
        this.captcha = ko.observable();
        this.delegationUrl = ko.observable();
    }

    @Param()
    public delegationUrl: ko.Observable<string>;

    /**
     * Initializes component right after creation.
     */
    @OnMounted()
    public async initialize(): Promise<void> {
        try {
            const isUserSignedIn = await this.usersService.isUserSignedIn();

            if (isUserSignedIn) {
                this.usersService.navigateToHome();
                return;
            } else {
                const redirectUrl = this.delegationUrl();
                if (redirectUrl) {
                    window.open(redirectUrl, "_self");
                }
            }
        }
        catch (error) {
            if (error.code === "Unauthorized" || error.code === "ResourceNotFound") {
                return;
            }

            throw error;
        }

        const settings = {
            // TODO: Registration terms could be rendered at publish time
            userRegistrationTerms: "Test userRegistrationTerms!!!",
            userRegistrationTermsEnabled: false,
            userRegistrationTermsConsentRequired: false
        };

        this.tenantSettings = settings as TenantSettings;

        if (this.tenantSettings && this.tenantSettings.userRegistrationTermsEnabled) {
            this.consented.extend(<any>{ equal: { params: true, message: "You must agree to registration terms." } });

            this.termsOfUse(settings.userRegistrationTerms);
            this.showHideLabel("Show");
            this.isConsentRequired(settings.userRegistrationTermsConsentRequired);
        }

        validation.init({
            insertMessages: false,
            errorElementClass: "is-invalid",
            decorateInputElement: true
        });

        this.email.extend(<any>{ required: { message: `Email is required.` }, email: true });
        this.password.extend(<any>{ required: { message: `Password is required.` }, minLength: 8 }); // TODO: password requirements should come from Management API.
        this.passwordConfirmation.extend(<any>{ equal: { message: "Password confirmation field must be equal to password.", params: this.password } });
        this.firstName.extend(<any>{ required: { message: `First name is required.` } });
        this.lastName.extend(<any>{ required: { message: `Last name is required.` } });
        this.captcha.extend(<any>{ required: { message: `Captcha is required.` } });
    }

    /**
     * Sends user signup request to Management API.
     */
    public async signup(): Promise<void> {
        this.errorMessages([]);

        let captchaSolution;
        let captchaFlowId;
        let captchaToken;
        let captchaType;

        WLSPHIP0.verify( (solution, token, param) => {
            WLSPHIP0.clientValidation();
            if (WLSPHIP0.error != "0")
            {
                this.captcha(null); //is not valid
                return;
            }
            else {
                captchaSolution = solution;
                captchaToken = token;
                captchaType = WLSPHIP0.type;
                const flowIdElement = <HTMLInputElement>document.getElementById("FlowId")
                captchaFlowId = flowIdElement.value;
                this.captcha("valid");
                return;
            }
        },'');

        const result = validation.group({
            email: this.email,
            password: this.password,
            passwordConfirmation: this.passwordConfirmation,
            firstName: this.firstName,
            lastName: this.lastName,
            captcha: this.captcha
        });

        const clientErrors = result();

        if (clientErrors.length > 0) {
            this.errorMessages(clientErrors);
            return;
        }

        const createSignupRequest: SignupRequest = {
            solution: captchaSolution,
            flowId: captchaFlowId,
            token: captchaToken,
            type: captchaType,
            signupData: {
                email: this.email(),
                firstName: this.firstName(),
                lastName: this.lastName(),
                password: this.password(),
                confirmation: "signup",
                appType: "developerPortal"
            }
        };

        try {
            await this.captchaService.sendSignupRequest(createSignupRequest);
            this.isUserRequested(true);
        }
        catch (error) {
            WLSPHIP0.reloadHIP();
            if (error.code === "ValidationError") {
                const details: any[] = error.details;

                if (details && details.length > 0) {
                    const errorMessages = details.map(item => `${item.message}`);
                    this.errorMessages(errorMessages);
                }
            }
            else {
                this.errorMessages(["Server error. Unable to send request. Please try again later."]);
                console.error("Sign up", error);
            }
        }
    }

    /**
     * Shows/hides registration terms.
     */
    public toggleRegistrationTerms(): void {
        if (this.showTerms()) {
            this.showHideLabel("Show");
        }
        else {
            this.showHideLabel("Hide");
        }

        this.showTerms(!this.showTerms());
    }
}