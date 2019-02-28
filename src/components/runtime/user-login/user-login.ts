import * as ko from "knockout";
import template from "./user-login.html";
import { Component, RuntimeComponent } from "@paperbits/common/ko/decorators";
import { UsersService } from "../../../services/usersService";
import { MapiError } from "../../../services/mapiError";
import { IRouteHandler } from "@paperbits/common/routing";

@RuntimeComponent({ selector: "user-login" })
@Component({
    selector: "user-login",
    template: template,
    injectable: "userLogin"
})
export class UserLogin {
    public userName: ko.Observable<string>;
    public userPassword: ko.Observable<string>;
    public errorMessage: ko.Observable<string>;
    public isError: ko.Observable<boolean>;
    public working: ko.Observable<boolean>;

    constructor(
        private readonly usersService: UsersService,
        private readonly routeHandler: IRouteHandler
    ) {
        this.userName = ko.observable("");
        this.userPassword = ko.observable("");
        this.errorMessage = ko.observable("");
        this.isError = ko.observable(false);
        this.working = ko.observable(false);

        this.signinClick = this.signinClick.bind(this);
        this.checkUser();
    }

    private async checkUser(): Promise<void> {
        if (this.usersService.isUserLoggedIn()) {
            if (!this.usersService.isCurrentUserAdmin()) {
                this.navigateToHome();
            }
        }
    }

    public navigateToHome(): void {
        location.assign("/");
    }

    public logout(): void {
        this.usersService.signOut();
        this.navigateToHome();
    }

    public async signinClick(): Promise<void> {
        this.isError(false);
        this.working(true);

        try {
            const userId = await this.usersService.signIn(this.userName(), this.userPassword());

            if (userId) {
                this.navigateToHome();
            }
            else {
                this.errorMessage("Please provide a valid email and password.");
                this.isError(true);
            }
        } 
        catch (error) {
            this.isError(true);
            
            if (error instanceof MapiError) {
                if (error.code === "identity_not_confirmed") {
                    this.errorMessage(`We found an unconfirmed account for the e-mail address ${this.userName()}. To complete the creation of your account we need to verify your e-mail address. We’ve sent an e-mail to ${this.userName()}. Please follow the instructions inside the e-mail to activate your account. If the e-mail doesn’t arrive within the next few minutes, please check your junk email folder`);

                    return;
                }

                this.errorMessage(error.message);
            }
        }
        this.working(false);
    }
}