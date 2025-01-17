import * as ko from "knockout";
import * as validation from "knockout.validation";
import template from "./change-password.html";
import { EventManager } from "@paperbits/common/events";
import { Component, OnMounted, Param, RuntimeComponent } from "@paperbits/common/ko/decorators";
import { Logger } from "@paperbits/common/logging";
import { ChangePasswordRequest } from "../../../../../contracts/resetRequest";
import { CaptchaData } from "../../../../../models/captchaData";
import { UsersService } from "../../../../../services";
import { BackendService } from "../../../../../services/backendService";
import { ErrorSources } from "../../../validation-summary/constants";
import { dispatchErrors, parseAndDispatchError } from "../../../validation-summary/utils";
import { ValidationMessages } from "../../../validationMessages";


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

    public setCaptchaValidation: (captchaValidator: ko.Observable<string>) => void;
    public refreshCaptcha: () => Promise<void>;
    public readonly captchaData: ko.Observable<CaptchaData>;

    constructor(
        private readonly usersService: UsersService,
        private readonly eventManager: EventManager,
        private readonly backendService: BackendService,
        private readonly logger: Logger
    ) {
        this.password = ko.observable();
        this.newPassword = ko.observable();
        this.passwordConfirmation = ko.observable();
        this.isChangeConfirmed = ko.observable(false);
        this.working = ko.observable(false);
        this.captcha = ko.observable();
        this.requireHipCaptcha = ko.observable();
        this.captchaData = ko.observable();

        validation.init({
            insertMessages: false,
            errorElementClass: "is-invalid",
            decorateInputElement: true
        });

        this.password.extend(<any>{ required: { message: ValidationMessages.passwordRequired } }); // TODO: password requirements should come from Management API.
        this.newPassword.extend(<any>{ required: { message: ValidationMessages.newPasswordRequired }, minLength: 8 }); // TODO: password requirements should come from Management API.
        this.newPassword.extend(<any>{ notEqual: { message: ValidationMessages.newPasswordMustBeDifferent, params: this.password } });
        this.passwordConfirmation.extend(<any>{ equal: { message: ValidationMessages.passwordConfirmationMustMatch, params: this.newPassword } });
        this.captcha.extend(<any>{ required: { message: ValidationMessages.captchaRequired } });
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

    public onCaptchaCreated(captchaValidate: (captchaValidator: ko.Observable<string>) => void, refreshCaptcha: () => Promise<void>) {
        this.setCaptchaValidation = captchaValidate;
        this.refreshCaptcha = refreshCaptcha;
    }

    /**
     * Sends user change password request to Management API.
     */
    public async changePassword(): Promise<void> {
        const captchaIsRequired = this.requireHipCaptcha();
        const validationGroup = {
            password: this.password,
            newPassword: this.newPassword,
            passwordConfirmation: this.passwordConfirmation
        };

        if (captchaIsRequired) {
            if (!this.setCaptchaValidation) {
                this.logger.trackEvent("CaptchaValidation", { message: "Captcha failed to initialize." });
                dispatchErrors(this.eventManager, ErrorSources.resetpassword, [ValidationMessages.captchaNotInitialized]);
                return;
            }

            validationGroup["captcha"] = this.captcha;
            this.setCaptchaValidation(this.captcha);
        }

        const result = validation.group(validationGroup);

        const clientErrors = result();

        if (clientErrors.length > 0) {
            result.showAllMessages();
            dispatchErrors(this.eventManager, ErrorSources.changepassword, clientErrors);
            return;
        }

        const user = await this.usersService.getCurrentUser();
        const credentials = `Basic ${Buffer.from(`${user.email}:${this.password()}`, "utf8").toString("base64")}`;
        let userId = await this.usersService.authenticate(credentials);

        if (!userId) {
            dispatchErrors(this.eventManager, ErrorSources.changepassword, ["Incorrect user name or password"]);
            return;
        }

        userId = `/users/${userId}`;

        try {
            this.working(true);
            dispatchErrors(this.eventManager, ErrorSources.changepassword, []);

            if (captchaIsRequired) {
                const captchaRequestData = this.captchaData();
                const resetRequest: ChangePasswordRequest = {
                    challenge: captchaRequestData.challenge,
                    solution: captchaRequestData.solution?.solution,
                    flowId: captchaRequestData.solution?.flowId,
                    token: captchaRequestData.solution?.token,
                    type: captchaRequestData.solution?.type,
                    userId: userId,
                    newPassword: this.newPassword()
                };
                await this.backendService.sendChangePassword(resetRequest, credentials);
            } else {
                await this.usersService.changePassword(userId, this.newPassword(), credentials);
            }
            this.isChangeConfirmed(true);
        } catch (error) {
            if (captchaIsRequired) {
                await this.refreshCaptcha();
            }

            parseAndDispatchError(this.eventManager, ErrorSources.changepassword, error, this.logger, undefined, detail => `${detail.target}: ${detail.message} \n`);
        } finally {
            this.working(false);
        }
    }
}
