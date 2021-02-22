import * as ko from "knockout";
import * as validation from "knockout.validation";
import template from "./change-password.html";
import { Component, RuntimeComponent, OnMounted, Param } from "@paperbits/common/ko/decorators";
import { ChangePasswordRequest } from "../../../../../contracts/resetRequest";
import { BackendService } from "../../../../../services/backendService";
import { UsersService } from "../../../../../services/usersService";
import { EventManager } from "@paperbits/common/events";
import { ValidationReport } from "../../../../../contracts/validationReport";

declare var WLSPHIP0;

@RuntimeComponent({
    selector: "change-password-runtime"
})
@Component({
    selector: "change-password-runtime",
    template: template
})
export class ChangePassword {
    public readonly password: ko.Observable<string>;
    public readonly newPassword: ko.Observable<string>;
    public readonly passwordConfirmation: ko.Observable<string>;
    public readonly isChangeConfirmed: ko.Observable<boolean>;
    public readonly working: ko.Observable<boolean>;
    public readonly captcha: ko.Observable<string>;

    constructor(
        private readonly usersService: UsersService,
        private readonly eventManager: EventManager,
        private readonly backendService: BackendService
    ) {
        this.password = ko.observable();
        this.newPassword = ko.observable();
        this.passwordConfirmation = ko.observable();
        this.isChangeConfirmed = ko.observable(false);
        this.working = ko.observable(false);
        this.captcha = ko.observable();
        this.requireHipCaptcha = ko.observable();

        validation.init({
            insertMessages: false,
            errorElementClass: "is-invalid",
            decorateInputElement: true
        });

        this.password.extend(<any>{ required: { message: `Password is required.` }, minLength: 8 }); // TODO: password requirements should come from Management API.
        this.newPassword.extend(<any>{ required: { message: `New password is required.` }, minLength: 8 }); // TODO: password requirements should come from Management API.
        this.passwordConfirmation.extend(<any>{ required: { message: `Password confirmation is required.` }, equal: { message: "Password confirmation field must be equal to new password.", params: this.newPassword } });
        this.captcha.extend(<any>{ required: { message: `Captcha is required.` } });
    }

    @Param()
    public requireHipCaptcha: ko.Observable<boolean>;

    /**
     * Initializes component right after creation.
     */
    @OnMounted()
    public async initialize(): Promise<void> {
        const isUserSignedIn = await this.usersService.isUserSignedIn();

        if (!isUserSignedIn) {
            this.usersService.navigateToHome();
            return;
        }
    }

    /**
     * Sends user change password request to Management API.
     */
    public async changePassword(): Promise<void> {
        const isCaptcha = this.requireHipCaptcha();
        const validationGroup = {
            password: this.password,
            newPassword: this.newPassword,
            passwordConfirmation: this.passwordConfirmation
        };

        let captchaSolution;
        let captchaFlowId;
        let captchaToken;
        let captchaType;

        if (isCaptcha) {
            validationGroup["captcha"] = this.captcha;

            WLSPHIP0.verify((solution, token, param) => {
                WLSPHIP0.clientValidation();
                if (WLSPHIP0.error !== 0) {
                    this.captcha(null); //is not valid
                    return;
                }
                else {
                    captchaSolution = solution;
                    captchaToken = token;
                    captchaType = WLSPHIP0.type;
                    const flowIdElement = <HTMLInputElement>document.getElementById("FlowId")
                    captchaFlowId = flowIdElement.value;
                    this.captcha("valid");
                    return;
                }
            }, '');
        }

        const result = validation.group(validationGroup);

        const clientErrors = result();

        if (clientErrors.length > 0) {
            result.showAllMessages();
            const validationReport: ValidationReport = {
                source: "changepassword",
                errors: clientErrors
            };
            this.eventManager.dispatchEvent("onValidationErrors", validationReport);
            return;
        }

        const user = await this.usersService.getCurrentUser();
        const credentials = `Basic ${btoa(`${user.email}:${this.password()}`)}`;
        let userId = await this.usersService.authenticate(credentials);

        if (!userId) {
            const validationReport: ValidationReport = {
                source: "changepassword",
                errors: ["Incorrect user name or password"]
            };
            this.eventManager.dispatchEvent("onValidationErrors", validationReport);
            return;
        }

        userId = `/users/${userId}`;

        try {
            this.working(true);

            if (isCaptcha) {
                const resetRequest: ChangePasswordRequest = {
                    solution: captchaSolution,
                    flowId: captchaFlowId,
                    token: captchaToken,
                    type: captchaType,
                    userId: userId,
                    newPassword: this.newPassword()
                };
                await this.backendService.sendChangePassword(resetRequest);
            } else {
                await this.usersService.changePassword(userId, this.newPassword());
            }
            this.isChangeConfirmed(true);

            const validationReport: ValidationReport = {
                source: "changepassword",
                errors: []
            };
            this.eventManager.dispatchEvent("onValidationErrors", validationReport);
        } catch (error) {
            if (isCaptcha) {
                WLSPHIP0.reloadHIP();
            }

            let errorMessages: string[];

            if (error.code === "ValidationError") {
                const details: any[] = error.details;

                if (details && details.length > 0) {
                    let message = "";
                    errorMessages = details.map(item => message = `${message}${item.target}: ${item.message} \n`);
                }
            }
            else {
                errorMessages = ["Server error. Unable to send request. Please try again later."];
            }

            const validationReport: ValidationReport = {
                source: "changepassword",
                errors: errorMessages
            };
            this.eventManager.dispatchEvent("onValidationErrors", validationReport);
        } finally {
            this.working(false);
        }
    }
}