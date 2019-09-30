import * as ko from "knockout";
import template from "./user-signin.html";
import { Component, RuntimeComponent, OnMounted } from "@paperbits/common/ko/decorators";
import { UsersService } from "../../../../../services/usersService";
import { MapiError } from "../../../../../services/mapiError";


@RuntimeComponent({ selector: "user-signin" })
@Component({
    selector: "user-signin",
    template: template,
    injectable: "userSignin"
})
export class UserSignin {
    public readonly username: ko.Observable<string>;
    public readonly password: ko.Observable<string>;
    public readonly canSubmit: ko.Computed<boolean>;
    public readonly errorMessages: ko.ObservableArray<string>;
    public readonly hasErrors: ko.Observable<boolean>;
    public readonly working: ko.Observable<boolean>;

    constructor(private readonly usersService: UsersService) {
        this.username = ko.observable("");
        this.password = ko.observable("");
        this.errorMessages = ko.observableArray([]);
        this.hasErrors = ko.observable(false);
        this.working = ko.observable(false);
        this.canSubmit = ko.pureComputed(() => {
            return !!this.username() && !!this.password() && !this.working();
        });
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        try {
            const userId = await this.usersService.getCurrentUserId();

            if (userId) {
                this.navigateToHome();
            }
        }
        catch (error) {
            if (error.code === "Unauthorized") {
                return;
            }

            if (error.code === "ResourceNotFound") {
                return;
            }
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
        this.hasErrors(false);
        this.working(true);

        try {
            const userId = await this.usersService.signIn(this.username(), this.password());

            if (userId) {
                this.navigateToHome();
            }
            else {
                this.errorMessages(["Please provide a valid email and password."]);
                this.hasErrors(true);
            }
        }
        catch (error) {
            this.hasErrors(true);

            if (error instanceof MapiError) {
                if (error.code === "identity_not_confirmed") {
                    this.errorMessages([`We found an unconfirmed account for the e-mail address ${this.username()}. To complete the creation of your account we need to verify your e-mail address. We’ve sent an e-mail to ${this.username()}. Please follow the instructions inside the e-mail to activate your account. If the e-mail doesn’t arrive within the next few minutes, please check your junk email folder`]);
                    return;
                }
                this.errorMessages([error.message]);
            }
        }
        this.working(false);
    }
}