import * as ko from "knockout";
import * as validation from "knockout.validation";
import { EventManager } from "@paperbits/common/events";
import { Component, OnMounted, Param, RuntimeComponent } from "@paperbits/common/ko/decorators";
import { Logger } from "@paperbits/common/logging";
import { ResetRequest } from "../../../../../contracts/resetRequest";
import { CaptchaData } from "../../../../../models/captchaData";
import { UsersService } from "../../../../../services";
import { BackendService } from "../../../../../services/backendService";
import { ErrorSources } from "../../../validation-summary/constants";
import { dispatchErrors, parseAndDispatchError } from "../../../validation-summary/utils";
import template from "./reset-password.html";

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
    public readonly captchaData: ko.Observable<CaptchaData>;
    public setCaptchaValidation: (captchaValidator: ko.Observable<string>) => void;
    public refreshCaptcha: () => Promise<void>;

    constructor(
        private readonly usersService: UsersService,
        private readonly eventManager: EventManager,
        private readonly backendService: BackendService,
        private readonly logger: Logger
    ) {
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

    public onCaptchaCreated(captchaValidate: (captchaValidator: ko.Observable<string>) => void, refreshCaptcha: () => Promise<void>) {
        this.setCaptchaValidation = captchaValidate;
        this.refreshCaptcha = refreshCaptcha;
    }

    /**
     * Sends user reset password request to Management API.
     */
    public async resetSubmit(): Promise<void> {
        const isCaptchaRequired = this.requireHipCaptcha();
        const validationGroup = { email: this.email };

        if (isCaptchaRequired) {
            validationGroup["captcha"] = this.captcha;

            if (!this.setCaptchaValidation) {
                this.logger.trackEvent("CaptchaValidation", { message: "Captcha failed to initialize." });
                dispatchErrors(this.eventManager, ErrorSources.resetpassword, ["Unable to validate entered characters due to internal errors. Try to refresh the page and repeat the operation."]);
                return;
            }

            this.setCaptchaValidation(this.captcha);
        }

        const result = validation.group(validationGroup);

        const clientErrors = result();

        if (clientErrors.length > 0) {
            result.showAllMessages();
            dispatchErrors(this.eventManager, ErrorSources.resetpassword, clientErrors);
            return;
        }

        try {
            this.working(true);

            if (isCaptchaRequired) {
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

            dispatchErrors(this.eventManager, ErrorSources.resetpassword, []);
        }
        catch (error) {
            if (isCaptchaRequired) {
                await this.refreshCaptcha();
            }

            parseAndDispatchError(this.eventManager, ErrorSources.resetpassword, error, undefined, detail => `${detail.target}: ${detail.message} \n`);
        }
        finally {
            this.working(false);
        }
    }
}
