import * as ko from "knockout";
import * as validation from "knockout.validation";
import template from "./signin.html";
import { EventManager } from "@paperbits/common/events";
import { Component, OnMounted, Param, RuntimeComponent } from "@paperbits/common/ko/decorators";
import { Router } from "@paperbits/common/routing/router";
import { MapiError } from "../../../../../errors/mapiError";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { UnauthorizedError } from "../../../../../errors/unauthorizedError";
import { UsersService } from "../../../../../services";
import { dispatchErrors } from "../../../validation-summary/utils";
import { ErrorSources } from "../../../validation-summary/constants";
import { ValidationMessages } from "../../../validationMessages";
import { Utils } from "../../../../../utils";

@RuntimeComponent({
    selector: "signin-runtime"
})
@Component({
    selector: "signin-runtime",
    template: template
})
export class Signin {
    public readonly username: ko.Observable<string>;
    public readonly password: ko.Observable<string>;
    public readonly errorMessages: ko.ObservableArray<string>;
    public readonly hasErrors: ko.Computed<boolean>;
    public readonly consented: ko.Observable<boolean>;
    public readonly working: ko.Observable<boolean>;

    constructor(
        private readonly usersService: UsersService,
        private readonly eventManager: EventManager,
        private readonly routeHelper: RouteHelper,
        private readonly router: Router
    ) {

        this.delegationUrl = ko.observable();
        this.username = ko.observable("");
        this.password = ko.observable("");
        this.errorMessages = ko.observableArray([]);
        this.hasErrors = ko.pureComputed(() => this.errorMessages().length > 0);
        // Next four variables are necessary for displaying Terms of Use. Will be called when the back-end implementation is done
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

        this.username.extend(<any>{ required: { message: ValidationMessages.emailRequired }, email: true });
        this.password.extend(<any>{ required: { message: ValidationMessages.passwordRequired } });
        this.consented.extend(<any>{ equal: { params: true, message: ValidationMessages.consentRequired } });
    }

    @Param()
    public delegationUrl: ko.Observable<string>;

    @Param()
    public termsEnabled: ko.Observable<boolean>;

    @Param()
    public termsOfUse: ko.Observable<string>;

    @Param()
    public isConsentRequired: ko.Observable<boolean>;

    @OnMounted()
    public async initialize(): Promise<void> {
        try {
            const userId = await this.usersService.getCurrentUserId();

            if (userId) {
                this.navigateToHome();
            }
            else {
                const redirectUrl = this.delegationUrl();

                if (redirectUrl) {
                    location.assign(redirectUrl);
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

    public navigateToHome(): void {
        this.usersService.navigateToHome();
    }

    public async signin(): Promise<void> {
        this.errorMessages([]);

        const validationGroup = {
            username: this.username,
            password: this.password
        };

        const result = validation.group(validationGroup);

        const clientErrors = result();

        if (clientErrors.length > 0) {
            result.showAllMessages();
            dispatchErrors(this.eventManager, ErrorSources.signin, clientErrors);
            this.errorMessages(clientErrors);
            return;
        }

        try {
            this.working(true);

            await this.usersService.signInWithBasic(this.username(), this.password());

            const clientReturnUrl = sessionStorage.getItem("returnUrl");
            const returnUrl = this.routeHelper.getQueryParameter("returnUrl") || clientReturnUrl;

            if (returnUrl) {
                await this.router.navigateTo(Utils.sanitizeReturnUrl(returnUrl));
                return;
            }

            this.navigateToHome(); // default redirect
        }
        catch (error) {
            if (error instanceof MapiError) {
                if (error.code === "identity_not_confirmed") {
                    const msg = [`We found an unconfirmed account for the e-mail address ${this.username()}. To complete the creation of your account we need to verify your e-mail address. We’ve sent an e-mail to ${this.username()}. Please follow the instructions inside the e-mail to activate your account. If the e-mail doesn’t arrive within the next few minutes, please check your junk email folder`];
                    dispatchErrors(this.eventManager, ErrorSources.signin, msg);
                    return;
                }

                this.errorMessages([error.message]);
                dispatchErrors(this.eventManager, ErrorSources.signin, [error.message]);
                return;
            }

            if (error instanceof UnauthorizedError) {
                this.errorMessages([error.message]);
                dispatchErrors(this.eventManager, ErrorSources.signin, [error.message]);
                return;
            }

            throw new Error(`Unable to complete signing in. Error: ${error.message}`);
        }
        finally {
            this.working(false);
        }
    }
}
