import * as ko from "knockout";
import * as validation from "knockout.validation";
import template from "./reset-password.html";
import { Component, RuntimeComponent, OnMounted } from "@paperbits/common/ko/decorators";
import { UsersService } from "../../../../services/usersService";
import { ResetRequest } from "../../../../contracts/resetRequest";
import { CaptchaService } from "../../../../services/captchaService";
import { IEventManager } from "@paperbits/common/events";
import { ValidationReport } from "../../../../contracts/validationReport";

declare var WLSPHIP0;

@RuntimeComponent({ selector: "reset-password" })
@Component({
    selector: "reset-password",
    template: template,
    injectable: "resetPassword"
})
export class ResetPassword {
    public readonly email: ko.Observable<string>;
    public readonly isResetRequested: ko.Observable<boolean>;
    public readonly working: ko.Observable<boolean>;
    public readonly captcha: ko.Observable<string>;

    constructor(
        private readonly usersService: UsersService,       
        private readonly captchaService: CaptchaService,
        private readonly eventManager: IEventManager) {
        this.email = ko.observable();
        this.isResetRequested = ko.observable(false);
        this.working = ko.observable(false);
        this.captcha = ko.observable();
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

        this.email.extend(<any>{ required: { message: `Email is required.` }, email: true });
        this.captcha.extend(<any>{ required: { message: `Captcha is required.` } });
    }

    /**
     * Sends user reset password request to Management API.
     */
    public async resetSubmit(): Promise<void> {

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
            email: this.email,
            captcha: this.captcha
        });

        const clientErrors = result();

        if (clientErrors.length > 0) {
            const validationReport: ValidationReport = {
                source: "resetpassword",
                errors: clientErrors
            };
            this.eventManager.dispatchEvent("onValidationErrors",validationReport);
            return;
        }

        const resetRequest: ResetRequest = {
            solution: captchaSolution,
            flowId: captchaFlowId,
            token: captchaToken,
            type: captchaType,
            email: this.email()
        };

        try {
            await this.captchaService.sendResetRequest(resetRequest);
            this.isResetRequested(true);
        }
        catch (error) {
            WLSPHIP0.reloadHIP();
            if (error.code === "ValidationError") {
                const details: any[] = error.details;

                if (details && details.length > 0) {
                    let message = "";
                    const errorMessages = details.map(item => message = `${message}${item.target}: ${item.message} \n`);
                    const validationReport: ValidationReport = {
                        source: "resetpassword",
                        errors: errorMessages
                    };
                    this.eventManager.dispatchEvent("onValidationErrors",validationReport);
                }
            }
            else {
                const validationReport: ValidationReport = {
                    source: "resetpassword",
                    errors: ["Server error. Unable to send request. Please try again later."]
                };
                this.eventManager.dispatchEvent("onValidationErrors",validationReport);
            }
        }
    }
}