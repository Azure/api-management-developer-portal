import * as ko from "knockout";
import * as validation from "knockout.validation";
import template from "./user-signin.html";
import { Component, RuntimeComponent, OnMounted, Param } from "@paperbits/common/ko/decorators";
import { UsersService } from "../../../../../services/usersService";
import { MapiError } from "../../../../../services/mapiError";
import { IEventManager } from "@paperbits/common/events/IEventManager";


@RuntimeComponent({
    selector: "user-signin"
})
@Component({
    selector: "user-signin",
    template: template,
    injectable: "userSignin"
})
export class UserSignin {
    public readonly username: ko.Observable<string>;
    public readonly password: ko.Observable<string>;
    public readonly errorMessages: ko.ObservableArray<string>;
    public readonly hasErrors: ko.Computed<boolean>;
    public readonly working: ko.Observable<boolean>;

    constructor(
        private readonly usersService: UsersService,
        private readonly eventManager: IEventManager
        ) {
            
        this.delegationUrl = ko.observable();
        this.username = ko.observable("");
        this.password = ko.observable("");
        this.errorMessages = ko.observableArray([]);
        this.hasErrors = ko.pureComputed(() => this.errorMessages().length > 0);
        this.working = ko.observable(false);
    }

    @Param()
    public delegationUrl: ko.Observable<string>;

    @OnMounted()
    public async initialize(): Promise<void> {
        try {
            const userId = await this.usersService.getCurrentUserId();

            if (userId) {
                this.navigateToHome();
            } else {
                const redirectUrl = this.delegationUrl();
                if (redirectUrl) {
                    window.open(redirectUrl, "_self");
                }
            }

            validation.init({
                insertMessages: false,
                errorElementClass: "is-invalid",
                decorateInputElement: true
            });

            this.username.extend(<any>{ required: { message: `Email is required.` }, email: true });
            this.password.extend(<any>{ required: { message: `Password is required.` }});
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

    public signOut(): void {
        this.usersService.signOut();
        this.navigateToHome();
    }

    public async signin(): Promise<void> {
        this.errorMessages([]);

        const result = validation.group({
            username: this.username,
            password: this.password
        });

        const clientErrors = result();

        if (clientErrors.length > 0) {
            const event = new CustomEvent("validationsummary", {detail: {msgs: clientErrors, from: "signin"}});
            this.eventManager.dispatchEvent("validationsummary",event);
            this.errorMessages(clientErrors);
            return;
        }
        this.working(true);
        try {
            const userId = await this.usersService.signIn(this.username(), this.password());

            if (userId) {
                this.navigateToHome();
                const event = new CustomEvent("validationsummary", {detail: {msgs: [], from: "signin"}});
                this.eventManager.dispatchEvent("validationsummary",event);
            }
            else {
                this.errorMessages(["Please provide a valid email and password."]);
                const event = new CustomEvent("validationsummary", {detail: {msgs: ["Please provide a valid email and password."], from: "signin"}});
                this.eventManager.dispatchEvent("validationsummary",event);
            }
        }
        catch (error) {
            if (error instanceof MapiError) {
                if (error.code === "identity_not_confirmed") {
                    const msg = [`We found an unconfirmed account for the e-mail address ${this.username()}. To complete the creation of your account we need to verify your e-mail address. We’ve sent an e-mail to ${this.username()}. Please follow the instructions inside the e-mail to activate your account. If the e-mail doesn’t arrive within the next few minutes, please check your junk email folder`];
                    const event = new CustomEvent("validationsummary", {detail: {msgs: msg, from: "signin"}});
                    this.eventManager.dispatchEvent("validationsummary",event);
                    return;
                }
                const event = new CustomEvent("validationsummary", {detail: {msgs: [error.message], from: "signin"}});
                this.eventManager.dispatchEvent("validationsummary",event);
                this.errorMessages([error.message]);
            }
        }
        finally {
            this.working(false);
        }
    }
}