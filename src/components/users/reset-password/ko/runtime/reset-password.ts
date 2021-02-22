import * as ko from "knockout";
import * as validation from "knockout.validation";
import template from "./reset-password.html";
import { EventManager } from "@paperbits/common/events";
import { Component, RuntimeComponent, OnMounted, Param } from "@paperbits/common/ko/decorators";
import { UsersService } from "../../../../../services/usersService";
import { ResetRequest } from "../../../../../contracts/resetRequest";
import { ValidationReport } from "../../../../../contracts/validationReport";
import { BackendService } from "../../../../../services/backendService";

declare var WLSPHIP0;

@RuntimeComponent({
    selector: "reset-password-runtime"
})
@Component({
    selector: "reset-password-runtime",
    template: template
})
export class ResetPassword {
    public readonly email: ko.Observable<string>;
    public readonly isResetRequested: ko.Observable<boolean>;
    public readonly working: ko.Observable<boolean>;
    public readonly captcha: ko.Observable<string>;

    constructor(
        private readonly usersService: UsersService,
        private readonly eventManager: EventManager,
        private readonly backendService: BackendService) {
        this.email = ko.observable();
        this.isResetRequested = ko.observable(false);
        this.working = ko.observable(false);
        this.captcha = ko.observable();
        this.requireHipCaptcha = ko.observable();

        validation.init({
            insertMessages: false,
            errorElementClass: "is-invalid",
            decorateInputElement: true
        });

        this.email.extend(<any>{ required: { message: `Email is required.` }, email: true });
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

        if (isUserSignedIn) {
            this.usersService.navigateToHome();
            return;
        }
    }

    /**
     * Sends user reset password request to Management API.
     */
    public async resetSubmit(): Promise<void> {
        const isCaptcha = this.requireHipCaptcha();
        const validationGroup = { email: this.email };

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
            }, "");
        }

        const result = validation.group(validationGroup);

        const clientErrors = result();

        if (clientErrors.length > 0) {
            result.showAllMessages();
            const validationReport: ValidationReport = {
                source: "resetpassword",
                errors: clientErrors
            };
            this.eventManager.dispatchEvent("onValidationErrors", validationReport);
            return;
        }

        try {
            this.working(true);
            
            if (isCaptcha) {
                const resetRequest: ResetRequest = {
                    solution: captchaSolution,
                    flowId: captchaFlowId,
                    token: captchaToken,
                    type: captchaType,
                    email: this.email()
                };
                await this.backendService.sendResetRequest(resetRequest);
            }
            else {
                await this.usersService.createResetPasswordRequest(this.email());
            }
            this.isResetRequested(true);

            const validationReport: ValidationReport = {
                source: "resetpassword",
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
            } else {
                errorMessages = ["Server error. Unable to send request. Please try again later."];
            }

            const validationReport: ValidationReport = {
                source: "resetpassword",
                errors: errorMessages
            };
            this.eventManager.dispatchEvent("onValidationErrors", validationReport);
        } finally {
            this.working(false);
        }
    }
}