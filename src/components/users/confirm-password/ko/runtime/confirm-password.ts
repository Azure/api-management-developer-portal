import * as ko from "knockout";
import * as validation from "knockout.validation";
import template from "./confirm-password.html";
import { Component, RuntimeComponent, OnMounted } from "@paperbits/common/ko/decorators";
import { BackendService } from "../../../../../services/backendService";
import { UsersService } from "../../../../../services/usersService";
import { EventManager } from "@paperbits/common/events";
import { ValidationReport } from "../../../../../contracts/validationReport";

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

        this.password.extend(<any>{ required: { message: `Password is required.` }, minLength: 8 }); // TODO: password requirements should come from Management API.
        this.passwordConfirmation.extend(<any>{ required: { message: `Password confirmation is required.` }, equal: { message: "Password confirmation field must be equal to password.", params: this.password } });
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
            const validationReport: ValidationReport = {
                source: "confirmpassword",
                errors: ["Required params not found"]
            };
            this.eventManager.dispatchEvent("onValidationErrors", validationReport);
            return;
        }

        try {            
            this.token = this.usersService.getTokenFromTicketParams(queryParams);
            this.userId = this.usersService.getUserIdFromParams(queryParams);

            if (!this.userId) {
                throw new Error("User not found.");
            }
        } catch (error) {
            const validationReport: ValidationReport = {
                source: "confirmpassword",
                errors: ["Activate user error: " + error.message]
            };
            this.eventManager.dispatchEvent("onValidationErrors", validationReport);
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
            const validationReport: ValidationReport = {
                source: "confirmpassword",
                errors: clientErrors
            };
            this.eventManager.dispatchEvent("onValidationErrors", validationReport);
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
            if (error.code === "ValidationError") {
                const details: any[] = error.details;

                if (details && details.length > 0) {
                    let message = "";
                    const errorMessages = details.map(item => message = `${message}${item.target}: ${item.message} \n`);
                    const validationReport: ValidationReport = {
                        source: "confirmpassword",
                        errors: errorMessages
                    };
                    this.eventManager.dispatchEvent("onValidationErrors", validationReport);
                }
            }
            else {
                const validationReport: ValidationReport = {
                    source: "confirmpassword",
                    errors: ["Server error. Unable to send request. Please try again later."]
                };
                this.eventManager.dispatchEvent("onValidationErrors", validationReport);
            }
        }
    }
}