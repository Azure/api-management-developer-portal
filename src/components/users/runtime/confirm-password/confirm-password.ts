import * as ko from "knockout";
import * as validation from "knockout.validation";
import template from "./confirm-password.html";
import { Component, RuntimeComponent, OnMounted } from "@paperbits/common/ko/decorators";
import { ResetPassword } from "../../../../contracts/resetRequest";
import { CaptchaService } from "../../../../services/captchaService";
import { UsersService } from "../../../../services/usersService";
import { IEventManager } from "@paperbits/common/events/IEventManager";

@RuntimeComponent({ selector: "confirm-password" })
@Component({
    selector: "confirm-password",
    template: template,
    injectable: "confirmPassword"
})
export class ConfirmPassword {
    private queryParams: URLSearchParams;
    private userId: string;
    private ticket: string;
    private ticketId: string;
    public readonly password: ko.Observable<string>;
    public readonly passwordConfirmation: ko.Observable<string>;
    public readonly isResetConfirmed: ko.Observable<boolean>;
    public readonly errorMessages: ko.ObservableArray<string>;
    public readonly working: ko.Observable<boolean>;
    public readonly canSubmit: ko.Computed<boolean>;

    constructor(
        private readonly usersService: UsersService,    
        private readonly captchaService: CaptchaService,
        private readonly eventManager: IEventManager) {
        this.password = ko.observable();
        this.passwordConfirmation = ko.observable();
        this.isResetConfirmed = ko.observable(false);
        this.errorMessages = ko.observableArray([]);
        this.working = ko.observable(false);
        this.canSubmit = ko.pureComputed(() => {
            return this.password() === this.passwordConfirmation();
        });
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

        validation.init({
            insertMessages: false,
            errorElementClass: "is-invalid",
            decorateInputElement: true
        });

        this.password.extend(<any>{ required: { message: `Password is required.` }, minLength: 8 }); // TODO: password requirements should come from Management API.
        this.passwordConfirmation.extend(<any>{ equal: { message: "Password confirmation field must be equal to password.", params: this.password } });

        this.queryParams = new URLSearchParams(location.search);

        if (!this.queryParams.has("userid") || !this.queryParams.has("ticketid") || !this.queryParams.has("ticket")) {
            this.errorMessages.push("Required params not found");
            const event = new CustomEvent("validationsummary", {detail: {msgs: ["Required params not found"], from: "confirmpassword"}});
            this.eventManager.dispatchEvent("validationsummary",event);
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
        this.errorMessages([]);
        const result = validation.group({
            password: this.password,
            passwordConfirmation: this.passwordConfirmation
        });

        const clientErrors = result();

        if (clientErrors.length > 0) {
            const event = new CustomEvent("validationsummary", {detail: {msgs: clientErrors, from: "confirmpassword"}});
            this.eventManager.dispatchEvent("validationsummary",event);
            this.errorMessages(clientErrors);
            return;
        }

        const resetPswdRequest: ResetPassword = {
            userid: this.userId,
            ticketid: this.ticketId,
            ticket: this.ticket,
            password: this.password()
        };

        try {
            await this.captchaService.sendConfirmRequest(resetPswdRequest);
            this.isResetConfirmed(true);
        }
        catch (error) {
            if (error.code === "ValidationError") {
                const details: any[] = error.details;

                if (details && details.length > 0) {
                    let message = "";
                    const errorMessages = details.map(item => message = `${message}${item.target}: ${item.message} \n`);
                    this.errorMessages(errorMessages);
                    const event = new CustomEvent("validationsummary", {detail: {msgs: errorMessages, from: "confirmpassword"}});
                    this.eventManager.dispatchEvent("validationsummary",event);
                }
            }
            else {
                this.errorMessages(["Server error. Unable to send request. Please try again later."]);
                const event = new CustomEvent("validationsummary", {detail: {msgs: ["Server error. Unable to send request. Please try again later."], from: "confirmpassword"}});
                this.eventManager.dispatchEvent("validationsummary",event);
            }
        }
    }
}