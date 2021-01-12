import * as ko from "knockout";
import * as validation from "knockout.validation";
import template from "./signin.html";
import { EventManager } from "@paperbits/common/events";
import { Component, RuntimeComponent, OnMounted, Param } from "@paperbits/common/ko/decorators";
import { UsersService } from "../../../../../services/usersService";
import { MapiError } from "../../../../../errors/mapiError";
import { ValidationReport } from "../../../../../contracts/validationReport";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { Router } from "@paperbits/common/routing/router";

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
        this.working = ko.observable(false);

        validation.init({
            insertMessages: false,
            errorElementClass: "is-invalid",
            decorateInputElement: true
        });

        this.username.extend(<any>{ required: { message: `Email is required.` }, email: true });
        this.password.extend(<any>{ required: { message: `Password is required.` } });
    }

    @Param()
    public delegationUrl: ko.Observable<string>;

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
    }

    public navigateToHome(): void {
        this.usersService.navigateToHome();
    }

    public async signin(): Promise<void> {
        this.errorMessages([]);

        const result = validation.group({
            username: this.username,
            password: this.password
        });

        const clientErrors = result();

        if (clientErrors.length > 0) {
            result.showAllMessages();
            const validationReport: ValidationReport = {
                source: "signin",
                errors: clientErrors
            };
            this.eventManager.dispatchEvent("onValidationErrors", validationReport);
            this.errorMessages(clientErrors);
            return;
        }

        try {
            this.working(true);
            
            const userId = await this.usersService.signIn(this.username(), this.password());

            if (userId) {
                const clientReturnUrl = sessionStorage.getItem("returnUrl");
                const returnUrl = this.routeHelper.getQueryParameter("returnUrl") || clientReturnUrl;
                
                if (returnUrl) {
                    this.router.navigateTo(returnUrl);
                    return;
                }
                
                this.navigateToHome();

                const validationReport: ValidationReport = {
                    source: "signin",
                    errors: []
                };

                this.eventManager.dispatchEvent("onValidationErrors", validationReport);
            }
            else {
                this.errorMessages(["Please provide a valid email and password."]);

                const validationReport: ValidationReport = {
                    source: "signin",
                    errors: ["Please provide a valid email and password."]
                };
                
                this.eventManager.dispatchEvent("onValidationErrors", validationReport);
            }
        }
        catch (error) {
            if (error instanceof MapiError) {
                if (error.code === "identity_not_confirmed") {
                    const msg = [`We found an unconfirmed account for the e-mail address ${this.username()}. To complete the creation of your account we need to verify your e-mail address. We’ve sent an e-mail to ${this.username()}. Please follow the instructions inside the e-mail to activate your account. If the e-mail doesn’t arrive within the next few minutes, please check your junk email folder`];
                    const validationReport: ValidationReport = {
                        source: "signin",
                        errors: msg
                    };
                    this.eventManager.dispatchEvent("onValidationErrors", validationReport);
                    return;
                }

                this.errorMessages([error.message]);

                const validationReport: ValidationReport = {
                    source: "signin",
                    errors: [error.message]
                };
                this.eventManager.dispatchEvent("onValidationErrors", validationReport);

                return;
            }

            throw new Error(`Unable to complete signing in. Error: ${error.message}`);
        }
        finally {
            this.working(false);
        }
    }
}