import * as ko from "knockout";
import * as validation from "knockout.validation";
import * as Constants from "../../../../../constants";
import template from "./signup-social.html";
import { Component, RuntimeComponent, OnMounted, Param } from "@paperbits/common/ko/decorators";
import { EventManager } from "@paperbits/common/events";
import { Router } from "@paperbits/common/routing";
import { Utils } from "../../../../../utils";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { UsersService } from "../../../../../services";
import { dispatchErrors, parseAndDispatchError } from "../../../validation-summary/utils";
import { ErrorSources } from "../../../validation-summary/constants";
import { ValidationMessages } from "../../../validationMessages";
import { Logger } from "@paperbits/common/logging";
import { eventTypes } from "../../../../../logging/clientLogger";


@RuntimeComponent({
    selector: "signup-social-runtime"
})
@Component({
    selector: "signup-social-runtime",
    template: template
})
export class SignupSocial {
    public readonly email: ko.Observable<string>;
    public readonly firstName: ko.Observable<string>;
    public readonly lastName: ko.Observable<string>;
    public readonly consented: ko.Observable<boolean>;
    public readonly working: ko.Observable<boolean>;

    constructor(
        private readonly eventManager: EventManager,
        private readonly router: Router,
        private readonly routeHelper: RouteHelper,
        private readonly usersService: UsersService,
        private readonly logger: Logger
    ) {
        this.email = ko.observable("");
        this.firstName = ko.observable("");
        this.lastName = ko.observable("");
        this.termsEnabled = ko.observable(false);
        this.termsOfUse = ko.observable();
        this.isConsentRequired = ko.observable(false);
        this.consented = ko.observable(false);
        this.working = ko.observable(false);

        validation.init({
            insertMessages: false,
            errorElementClass: "is-invalid",
            decorateInputElement: true
        });

        this.email.extend(<any>{ required: { message: ValidationMessages.emailRequired }, email: true });
        this.firstName.extend(<any>{ required: { message: ValidationMessages.firstNameRequired } });
        this.lastName.extend(<any>{ required: { message: ValidationMessages.lastNameRequired } });
        this.consented.extend(<any>{ equal: { params: true, message: ValidationMessages.consentRequired } });
    }

    @Param()
    public termsOfUse: ko.Observable<string>;

    @Param()
    public isConsentRequired: ko.Observable<boolean>;

    @Param()
    public termsEnabled: ko.Observable<boolean>;

    /**
     * Initializes component after creation.
     */
    @OnMounted()
    public async initialize(): Promise<void> {
        const provider = this.routeHelper.getIdTokenProvider();
        const idToken = this.routeHelper.getIdToken();

        if (!provider || !idToken) {
            await this.router.navigateTo(Constants.pageUrlSignIn);
            return;
        }

        const jwtToken = Utils.parseJwt(idToken);

        this.firstName(jwtToken.given_name);
        this.lastName(jwtToken.family_name);
        this.email(jwtToken.email || jwtToken.emails?.[0]);

        this.logger.trackEvent(eventTypes.trace, { message: "Signup social component initialized." });
    }

    /**
     * Sends user signup request to Management API.
     */
    public async signup(): Promise<void> {
        const validationGroup = {
            email: this.email,
            firstName: this.firstName,
            lastName: this.lastName
        };

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

        dispatchErrors(this.eventManager, ErrorSources.signup, []);
        try {
            const provider = this.routeHelper.getIdTokenProvider();
            const idToken = this.routeHelper.getIdToken();

            if (!provider || !idToken) {
                await this.router.navigateTo(Constants.pageUrlSignIn);
                return;
            }

            await this.usersService.createUserWithOAuth(provider, idToken, this.firstName(), this.lastName(), this.email());
            await this.router.navigateTo(Constants.pageUrlHome);
        } catch (error) {
            parseAndDispatchError(this.eventManager, ErrorSources.signup, error, this.logger, Constants.genericHttpRequestError);
        }
    }
}
