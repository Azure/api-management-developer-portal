import * as ko from "knockout";
import * as validation from "knockout.validation";
import * as Constants from "../../../../../constants";
import template from "./reset-password.html";
import { EventManager } from "@paperbits/common/events";
import { Component, RuntimeComponent, OnMounted, Param } from "@paperbits/common/ko/decorators";
import { UsersService } from "../../../../../services/usersService";
import { ResetRequest } from "../../../../../contracts/resetRequest";
import { ValidationReport } from "../../../../../contracts/validationReport";
import { BackendService } from "../../../../../services/backendService";
import { CaptchaData } from "../../../../../models/captchaData";

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
    
    public setCaptchaValidation: (captchaValidator: ko.Observable<string>) => void;
    public refreshCaptcha: () => Promise<void>;
    public readonly captchaData: ko.Observable<CaptchaData>;


    constructor(
        private readonly usersService: UsersService,
        private readonly eventManager: EventManager,
        private readonly backendService: BackendService) {
        this.email = ko.observable();
        this.isResetRequested = ko.observable(false);
        this.working = ko.observable(false);
        this.captcha = ko.observable();
        this.requireHipCaptcha = ko.observable();
        this.captchaData = ko.observable();

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
    
    public onCaptchaCreated(captchaValidate: (captchaValidator: ko.Observable<string>) => void, refreshCaptcha: () => Promise<void>){
        this.setCaptchaValidation = captchaValidate;
        this.refreshCaptcha = refreshCaptcha;
    }

    /**
     * Sends user reset password request to Management API.
     */
    public async resetSubmit(): Promise<void> {
        const isCaptcha = this.requireHipCaptcha();
        const validationGroup = { email: this.email };

        if (isCaptcha) {
            validationGroup["captcha"] = this.captcha;
            this.setCaptchaValidation(this.captcha);
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
                const captchaRequestData = this.captchaData();
                const resetRequest: ResetRequest = {
                    challenge: captchaRequestData.challenge, 
                    solution: captchaRequestData.solution?.solution,
                    flowId: captchaRequestData.solution?.flowId,
                    token: captchaRequestData.solution?.token,
                    type: captchaRequestData.solution?.type,
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
        } 
        catch (error) {
            if (isCaptcha) {
                await this.refreshCaptcha();
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
                errorMessages = [Constants.genericHttpRequestError];
            }

            const validationReport: ValidationReport = {
                source: "resetpassword",
                errors: errorMessages
            };
            this.eventManager.dispatchEvent("onValidationErrors", validationReport);
        } 
        finally {
            this.working(false);
        }
    }
}