import * as ko from "knockout";
import * as validation from "knockout.validation";
import * as Constants from "../../../../../constants";
import template from "./signup.html";
import { Component, RuntimeComponent, OnMounted, Param } from "@paperbits/common/ko/decorators";
import { EventManager } from "@paperbits/common/events";
import { BackendService } from "../../../../../services/backendService";
import { UsersService } from "../../../../../services";
import { MapiSignupRequest, SignupRequest } from "../../../../../contracts/signupRequest";
import { CaptchaData } from "../../../../../models/captchaData";
import { dispatchErrors, parseAndDispatchError } from "../../../validation-summary/utils";
import { ErrorSources } from "../../../validation-summary/constants";
import { Router } from "@paperbits/common/routing/router";
import { ValidationMessages } from "../../../validationMessages";
import { Logger } from "@paperbits/common/logging";

@RuntimeComponent({
    selector: "signup-runtime"
})
@Component({
    selector: "signup-runtime",
    template: template
})
export class Signup {
    public readonly email: ko.Observable<string>;
    public readonly password: ko.Observable<string>;
    public readonly passwordConfirmation: ko.Observable<string>;
    public readonly firstName: ko.Observable<string>;
    public readonly lastName: ko.Observable<string>;
    public readonly isUserRequested: ko.Observable<boolean>;
    public readonly consented: ko.Observable<boolean>;
    public readonly working: ko.Observable<boolean>;
    public readonly captcha: ko.Observable<string>;

    public setCaptchaValidation: (captchaValidator: ko.Observable<string>) => void;
    public refreshCaptcha: () => Promise<void>;
    public readonly captchaData: ko.Observable<CaptchaData>;

    constructor(
        private readonly router: Router,
        private readonly usersService: UsersService,
        private readonly eventManager: EventManager,
        private readonly backendService: BackendService,
        private readonly logger: Logger
    ) {
        this.email = ko.observable("");
        this.password = ko.observable("");
        this.passwordConfirmation = ko.observable("");
        this.firstName = ko.observable("");
        this.lastName = ko.observable("");
        this.isUserRequested = ko.observable(false);
        this.termsEnabled = ko.observable(false);
        this.termsOfUse = ko.observable();
        this.isConsentRequired = ko.observable(false);
        this.consented = ko.observable(false);
        this.working = ko.observable(false);
        this.captcha = ko.observable();
        this.delegationUrl = ko.observable();
        this.requireHipCaptcha = ko.observable();
        this.captchaData = ko.observable();

        validation.init({
            insertMessages: false,
            errorElementClass: "is-invalid",
            decorateInputElement: true
        });

        this.email.extend(<any>{ required: { message: ValidationMessages.emailRequired }, email: true });
        this.password.extend(<any>{ required: { message: ValidationMessages.passwordRequired }, minLength: 8 }); // TODO: password requirements should come from Management API.
        this.passwordConfirmation.extend(<any>{ equal: { message: ValidationMessages.passwordConfirmationMustMatch, params: this.password } });
        this.firstName.extend(<any>{ required: { message: ValidationMessages.firstNameRequired } });
        this.lastName.extend(<any>{ required: { message: ValidationMessages.lastNameRequired } });
        this.captcha.extend(<any>{ required: { message: ValidationMessages.captchaRequired } });
        this.consented.extend(<any>{ equal: { params: true, message: ValidationMessages.consentRequired } });
    }


    @Param()
    public requireHipCaptcha: ko.Observable<boolean>;

    @Param()
    public termsOfUse: ko.Observable<string>;

    @Param()
    public isConsentRequired: ko.Observable<boolean>;

    @Param()
    public termsEnabled: ko.Observable<boolean>;

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
            }
            else {
                const queryParams = new URLSearchParams(location.search);

                if (queryParams.has("userid") && queryParams.has("ticketid") && queryParams.has("ticket")) {
                    await this.usersService.activateUser(queryParams);

                    const userId = await this.usersService.getCurrentUserId();

                    if (!userId) {
                        console.error("Activate user error: User not found.");
                    } else {
                        this.usersService.navigateToHome();
                    }
                } else {
                    const redirectUrl = this.delegationUrl();

                    if (redirectUrl) {
                        await this.router.navigateTo(redirectUrl);
                    }
                }
            }
        }
        catch (error) {
            if (error.code === "Unauthorized" || error.code === "ResourceNotFound") {
                return;
            }

            throw error;
        }
    }

    public onCaptchaCreated(captchaValidate: (captchaValidator: ko.Observable<string>) => void, refreshCaptcha: () => Promise<void>) {
        this.setCaptchaValidation = captchaValidate;
        this.refreshCaptcha = refreshCaptcha;
    }

    /**
     * Sends user signup request to Management API.
     */
    public async signup(): Promise<void> {
        const captchaIsRequired = this.requireHipCaptcha();

        const validationGroup = {
            email: this.email,
            password: this.password,
            passwordConfirmation: this.passwordConfirmation,
            firstName: this.firstName,
            lastName: this.lastName
        };

        if (captchaIsRequired) {
            if (!this.setCaptchaValidation) {
                this.logger.trackEvent("CaptchaValidation", { message: "Captcha failed to initialize." });
                dispatchErrors(this.eventManager, ErrorSources.resetpassword, [ValidationMessages.captchaNotInitialized]);
                return;
            }

            validationGroup["captcha"] = this.captcha;
            this.setCaptchaValidation(this.captcha);
        }

        if (this.termsEnabled() && this.isConsentRequired()) {
            validationGroup["consented"] = this.consented;
        }

        const result = validation.group(validationGroup);

        const clientErrors = result();

        if (clientErrors.length > 0) {
            result.showAllMessages();
            dispatchErrors(this.eventManager, ErrorSources.signup, clientErrors);
            return;
        }

        const mapiSignupData: MapiSignupRequest = {
            email: this.email(),
            firstName: this.firstName(),
            lastName: this.lastName(),
            password: this.password(),
            confirmation: "signup",
            appType: Constants.AppType
        };

        try {
            this.working(true);
            dispatchErrors(this.eventManager, ErrorSources.signup, []);

            if (captchaIsRequired) {
                const captchaRequestData = this.captchaData();
                const createSignupRequest: SignupRequest = {
                    challenge: captchaRequestData.challenge,
                    solution: captchaRequestData.solution?.solution,
                    flowId: captchaRequestData.solution?.flowId,
                    token: captchaRequestData.solution?.token,
                    type: captchaRequestData.solution?.type,
                    signupData: mapiSignupData
                };

                await this.backendService.sendSignupRequest(createSignupRequest);
            }
            else {
                await this.usersService.createSignupRequest(mapiSignupData);
            }

            this.isUserRequested(true);
        }
        catch (error) {
            if (captchaIsRequired) {
                await this.refreshCaptcha();
            }

            parseAndDispatchError(this.eventManager, ErrorSources.signup, error, this.logger, Constants.genericHttpRequestError);
        }
        finally {
            this.working(false);
        }
    }
}
