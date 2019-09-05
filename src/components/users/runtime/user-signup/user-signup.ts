import * as ko from "knockout";
import * as validation from "knockout.validation";
import template from "./user-signup.html";
import { Component, RuntimeComponent, OnMounted } from "@paperbits/common/ko/decorators";
import { UsersService } from "../../../../services/usersService";
import { TenantSettings } from "../../../../contracts/tenantSettings";
import { SignupRequest } from "../../../../contracts/signupRequest";


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
    public readonly isUserLoggedIn: ko.Observable<boolean>;
    public readonly isConsentRequired: ko.Observable<boolean>;
    public readonly termsOfUse: ko.Observable<string>;
    public readonly showTerms: ko.Observable<boolean>;
    public readonly consented: ko.Observable<boolean>;
    public readonly showHideLabel: ko.Observable<string>;
    public readonly errorMessages: ko.ObservableArray<string>;
    public readonly working: ko.Observable<boolean>;
    public readonly hasErrors: ko.Computed<boolean>;
    public readonly canSubmit: ko.Computed<boolean>;

    constructor(private readonly usersService: UsersService) {
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
        this.isUserLoggedIn = ko.observable(false);
        this.working = ko.observable(false);
        this.hasErrors = ko.pureComputed(() => {
            return this.errorMessages().length > 0;
        });
        this.canSubmit = ko.pureComputed(() => {
            return true;

            // return ((this.termsOfUse() && this.isConsentRequired() && this.consented())
            //     || !this.isConsentRequired()
            //     || !!!this.termsOfUse());
        });
    }

    /**
     * Initializes component right after creation.
     */
    @OnMounted()
    public async initialize(): Promise<void> {
        const isUserSignedIn = await this.usersService.isUserSignedIn();

        if (isUserSignedIn) {
            this.usersService.navigateToHome();
            return;
        }

        // TODO: Registration terms could be rendered at pubnlish time
        // const settings = await this.tenantService.getSettings(); 

        const settings = {
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
    }

    /**
     * Sends user signup request to Management API.
     */
    public async signup(): Promise<void> {
        this.errorMessages([]);

        const result = validation.group({
            email: this.email,
            password: this.password,
            passwordConfirmation: this.passwordConfirmation,
            firstName: this.firstName,
            lastName: this.lastName
        });

        const clientErrors = result();

        if (clientErrors.length > 0) {
            this.errorMessages(clientErrors);
            return;
        }

        const createSignupRequest: SignupRequest = {
            email: this.email(),
            firstName: this.firstName(),
            lastName: this.lastName(),
            password: this.password(),
            confirmation: "signup",
            appType: "developerPortal"
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
                    const errorMessages = details.map(item => message = `${message}${item.target}: ${item.message} \n`);
                    this.errorMessages(errorMessages);
                }
            }
            else {
                throw new Error(error);
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