import * as ko from "knockout";
import * as validation from "knockout.validation";
import template from "./confirm-password.html";
import { Component, RuntimeComponent, OnMounted } from "@paperbits/common/ko/decorators";
import { ResetPassword } from "../../../../../contracts/resetRequest";
import { BackendService } from "../../../../../services/backendService";
import { UsersService } from "../../../../../services/usersService";
import { EventManager } from "@paperbits/common/events";
import { ValidationReport } from "../../../../../contracts/validationReport";

@RuntimeComponent({ selector: "confirm-password" })
@Component({
    selector: "confirm-password",
    template: template
})
export class ConfirmPassword {
    private queryParams: URLSearchParams;
    private userId: string;
    private ticket: string;
    private ticketId: string;
    public readonly password: ko.Observable<string>;
    public readonly passwordConfirmation: ko.Observable<string>;
    public readonly isResetConfirmed: ko.Observable<boolean>;
    public readonly working: ko.Observable<boolean>;
    public readonly canSubmit: ko.Computed<boolean>;

    constructor(
        private readonly usersService: UsersService,
        private readonly eventManager: EventManager,
        private readonly backendService: BackendService) {
        this.password = ko.observable();
        this.passwordConfirmation = ko.observable();
        this.isResetConfirmed = ko.observable(false);
        this.working = ko.observable(false);
        this.canSubmit = ko.pureComputed(() => {
            return this.password() === this.passwordConfirmation();
        });

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
        const isUserSignedIn = await this.usersService.isUserSignedIn();

        if (isUserSignedIn) {
            this.usersService.navigateToHome();
            return;
        }

        this.queryParams = new URLSearchParams(location.search);

        if (!this.queryParams.has("userid") || !this.queryParams.has("ticketid") || !this.queryParams.has("ticket")) {
            const validationReport: ValidationReport = {
                source: "confirmpassword",
                errors: ["Required params not found"]
            };
            this.eventManager.dispatchEvent("onValidationErrors",validationReport);
            return;
        }

        this.userId = this.queryParams.get("userid");
        this.ticket = this.queryParams.get("ticket");
        this.ticketId = this.queryParams.get("ticketid");
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
            this.eventManager.dispatchEvent("onValidationErrors",validationReport);
            return;
        }

        const resetPswdRequest: ResetPassword = {
            userid: this.userId,
            ticketid: this.ticketId,
            ticket: this.ticket,
            password: this.password()
        };

        try {
            await this.backendService.sendConfirmRequest(resetPswdRequest);
            this.isResetConfirmed(true);
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
                    this.eventManager.dispatchEvent("onValidationErrors",validationReport);
                }
            }
            else {
                const validationReport: ValidationReport = {
                    source: "confirmpassword",
                    errors: ["Server error. Unable to send request. Please try again later."]
                };
                this.eventManager.dispatchEvent("onValidationErrors",validationReport);
            }
        }
    }
}