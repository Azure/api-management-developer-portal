import * as ko from "knockout";
import * as validation from "knockout.validation";
import template from "./change-password.html";
import { Component, RuntimeComponent, OnMounted } from "@paperbits/common/ko/decorators";
import { ChangePasswordRequest } from "../../../../contracts/resetRequest";
import { CaptchaService } from "../../../../services/captchaService";
import { UsersService } from "../../../../services/usersService";
import { IEventManager } from "@paperbits/common/events";
import { ValidationReport } from "../../../../contracts/validationReport";

declare var WLSPHIP0;

@RuntimeComponent({ selector: "change-password" })
@Component({
    selector: "change-password",
    template: template,
    injectable: "changePassword"
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
        private readonly captchaService: CaptchaService,
        private readonly eventManager: IEventManager) {
        this.password = ko.observable();
        this.newPassword = ko.observable();
        this.passwordConfirmation = ko.observable();
        this.isChangeConfirmed = ko.observable(false);
        this.working = ko.observable(false);
        this.captcha = ko.observable();
    }

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

        validation.init({
            insertMessages: false,
            errorElementClass: "is-invalid",
            decorateInputElement: true
        });

        this.password.extend(<any>{ required: { message: `Password is required.` }, minLength: 8 }); // TODO: password requirements should come from Management API.
        this.newPassword.extend(<any>{ required: { message: `New password is required.` }, minLength: 8 }); // TODO: password requirements should come from Management API.
        this.passwordConfirmation.extend(<any>{ equal: { message: "Password confirmation field must be equal to new password.", params: this.newPassword } });
        this.captcha.extend(<any>{ required: { message: `Captcha is required.` } });
    }

    /**
     * Sends user change password request to Management API.
     */
    public async changePassword(): Promise<void> {

        let captchaSolution;
        let captchaFlowId;
        let captchaToken;
        let captchaType;

        WLSPHIP0.verify( (solution, token, param) => {
            WLSPHIP0.clientValidation();
            if (WLSPHIP0.error != "0")
            {
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
        },'');

        const result = validation.group({
            password: this.password,
            newPassword: this.newPassword,
            passwordChangeation: this.passwordConfirmation,
            captcha: this.captcha
        });

        const clientErrors = result();

        if (clientErrors.length > 0) {
            const validationReport: ValidationReport = {
                source: "changepassword",
                errors: clientErrors
            };
            this.eventManager.dispatchEvent("onValidationErrors",validationReport);
            return;
        }

        const user = await this.usersService.getCurrentUser();

        const userId = await this.usersService.checkCredentials(user.email, this.password());

        if (!userId) {
            const validationReport: ValidationReport = {
                source: "changepassword",
                errors: ["Password is not valid"]
            };
            this.eventManager.dispatchEvent("onValidationErrors",validationReport);
            return;
        }

        const resetRequest: ChangePasswordRequest = {
            solution: captchaSolution,
            flowId: captchaFlowId,
            token: captchaToken,
            type: captchaType,
            userId: userId,
            newPassword: this.newPassword()
        };

        try {
            await this.captchaService.sendChangePassword(resetRequest);
            this.isChangeConfirmed(true);
        }
        catch (error) {
            WLSPHIP0.reloadHIP();
            if (error.code === "ValidationError") {
                const details: any[] = error.details;

                if (details && details.length > 0) {
                    let message = "";
                    const errorMessages = details.map(item => message = `${message}${item.target}: ${item.message} \n`);
                    const validationReport: ValidationReport = {
                        source: "changepassword",
                        errors: errorMessages
                    };
                    this.eventManager.dispatchEvent("onValidationErrors",validationReport);
                }
            }
            else {
                const validationReport: ValidationReport = {
                    source: "changepassword",
                    errors: ["Server error. Unable to send request. Please try again later."]
                };
                this.eventManager.dispatchEvent("onValidationErrors",validationReport);
            }
        }
    }
}