import * as ko from "knockout";
import * as validation from "knockout.validation";
import * as Constants from "../../../../../constants";
import template from "./signup-social.html";
import { Component, RuntimeComponent, OnMounted } from "@paperbits/common/ko/decorators";
import { EventManager } from "@paperbits/common/events";
import { Router } from "@paperbits/common/routing";
import { ValidationReport } from "../../../../../contracts/validationReport";
import { Utils } from "../../../../../utils";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { UsersService } from "../../../../../services";


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
    public readonly working: ko.Observable<boolean>;

    constructor(
        private readonly eventManager: EventManager,
        private readonly router: Router,
        private readonly routeHelper: RouteHelper,
        private readonly usersService: UsersService
    ) {
        this.email = ko.observable("");
        this.firstName = ko.observable("");
        this.lastName = ko.observable("");
        this.working = ko.observable(false);

        validation.init({
            insertMessages: false,
            errorElementClass: "is-invalid",
            decorateInputElement: true
        });

        this.email.extend(<any>{ required: { message: `Email is required.` }, email: true });
        this.firstName.extend(<any>{ required: { message: `First name is required.` } });
        this.lastName.extend(<any>{ required: { message: `Last name is required.` } });
    }

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
        this.email(jwtToken.email);
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

        const result = validation.group(validationGroup);

        const clientErrors = result();

        if (clientErrors.length > 0) {
            result.showAllMessages();
            const validationReport: ValidationReport = {
                source: "signup",
                errors: clientErrors
            };
            this.eventManager.dispatchEvent("onValidationErrors", validationReport);
            return;
        }

        try {
            const provider = this.routeHelper.getIdTokenProvider();
            const idToken = this.routeHelper.getIdToken();

            if (!provider || !idToken) {
                await this.router.navigateTo(Constants.pageUrlSignIn);
                return;
            }

            const validationReport: ValidationReport = {
                source: "signup",
                errors: []
            };

            this.eventManager.dispatchEvent("onValidationErrors", validationReport);

            await this.usersService.createUserWithOAuth(provider, idToken, this.firstName(), this.lastName(), this.email());
            await this.router.navigateTo(Constants.pageUrlHome);
        }
        catch (error) {
            let errorMessages: string[];

            if (error.code === "ValidationError") {
                const details: any[] = error.details;

                if (details && details.length > 0) {
                    errorMessages = details.map(item => `${item.message}`);
                }
            }
            else {
                errorMessages = ["Server error. Unable to send request. Please try again later."];
            }

            const validationReport: ValidationReport = {
                source: "signup",
                errors: errorMessages
            };
            this.eventManager.dispatchEvent("onValidationErrors", validationReport);
        }
    }
}