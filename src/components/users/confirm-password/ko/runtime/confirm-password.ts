import * as ko from "knockout";
import * as validation from "knockout.validation";
import template from "./confirm-password.html";
import { EventManager } from "@paperbits/common/events";
import { Component, OnMounted, RuntimeComponent } from "@paperbits/common/ko/decorators";
import { UsersService } from "../../../../../services";
import { ErrorSources } from "../../../validation-summary/constants";
import { dispatchErrors, parseAndDispatchError } from "../../../validation-summary/utils";
import { ValidationMessages } from "../../../validationMessages";

@RuntimeComponent({
    selector: "confirm-password"
})
@Component({
    selector: "confirm-password",
    template: template
})
export class ConfirmPassword {
    private userId: string;
    private token: string;
    public readonly password: ko.Observable<string>;
    public readonly passwordConfirmation: ko.Observable<string>;
    public readonly isResetConfirmed: ko.Observable<boolean>;
    public readonly working: ko.Observable<boolean>;

    constructor(
        private readonly usersService: UsersService,
        private readonly eventManager: EventManager) {
        this.password = ko.observable();
        this.passwordConfirmation = ko.observable();
        this.isResetConfirmed = ko.observable(false);
        this.working = ko.observable(false);

        validation.init({
            insertMessages: false,
            errorElementClass: "is-invalid",
            decorateInputElement: true
        });

        this.password.extend(<any>{ required: { message: ValidationMessages.passwordRequired }, minLength: 8 }); // TODO: password requirements should come from Management API.
        this.passwordConfirmation.extend(<any>{ equal: { message: ValidationMessages.passwordConfirmationMustMatch, params: this.password } });
    }

    /**
     * Initializes component right after creation.
     */
    @OnMounted()
    public async initialize(): Promise<void> {
        this.userId = await this.usersService.getCurrentUserId();

        if (this.userId) {
            return;
        }

        const queryParams = new URLSearchParams(location.search);

        if (!queryParams.has("userid") || !queryParams.has("ticketid") || !queryParams.has("ticket")) {
            dispatchErrors(this.eventManager, ErrorSources.confirmpassword, ["Required params not found"]);
            return;
        }

        try {
            this.token = this.usersService.getTokenFromTicketParams(queryParams);
            this.userId = this.usersService.getUserIdFromParams(queryParams);

            if (!this.userId) {
                throw new Error("User not found.");
            }
        } catch (error) {
            dispatchErrors(this.eventManager, ErrorSources.confirmpassword, ["Activate user error: " + error.message]);
        }
    }

    /**
     * Sends user resetPswd request to Management API.
     */
    public async resetPswd(): Promise<void> {
        const result = validation.group({
            password: this.password,
            passwordConfirmation: this.passwordConfirmation
        });

        const clientErrors = result();

        if (clientErrors.length > 0) {
            result.showAllMessages();
            dispatchErrors(this.eventManager, ErrorSources.confirmpassword, clientErrors);
            return;
        }

        try {
            await this.usersService.updatePassword(this.userId, this.password(), this.token);
            this.isResetConfirmed(true);
            setTimeout(() => {
                this.usersService.navigateToHome();
            }, 1000);
        }
        catch (error) {
            parseAndDispatchError(this.eventManager, ErrorSources.confirmpassword, error, undefined, detail => `${detail.target}: ${detail.message} \\n`);
        }
    }
}
