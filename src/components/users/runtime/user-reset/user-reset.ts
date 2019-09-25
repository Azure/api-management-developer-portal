import * as ko from "knockout";
import * as validation from "knockout.validation";
import template from "./user-reset.html";
import { Component, RuntimeComponent, OnMounted } from "@paperbits/common/ko/decorators";
import { UsersService } from "../../../../services/usersService";
import { ResetRequest } from "../../../../contracts/resetRequest";
import { CaptchaService } from "../../../../services/captchaService";

declare var WLSPHIP0;

@RuntimeComponent({ selector: "user-reset" })
@Component({
    selector: "user-reset",
    template: template,
    injectable: "userReset"
})
export class UserReset {
    public readonly email: ko.Observable<string>;
    public readonly isResetRequested: ko.Observable<boolean>;
    public readonly errorMessages: ko.ObservableArray<string>;
    public readonly working: ko.Observable<boolean>;
    public readonly hasErrors: ko.Computed<boolean>;
    public readonly captcha: ko.Observable<string>;

    constructor(
        private readonly usersService: UsersService,       
        private readonly captchaService: CaptchaService) {
        this.email = ko.observable();
        this.errorMessages = ko.observableArray([]);
        this.isResetRequested = ko.observable(false);
        this.working = ko.observable(false);
        this.hasErrors = ko.pureComputed(() => {
            return this.errorMessages().length > 0;
        });
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
        this.errorMessages([]);

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
            this.errorMessages(clientErrors);
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
                    this.errorMessages(errorMessages);
                }
            }
            else {
                this.errorMessages(["Server error. Unable to send request. Please try again later."]);
                console.error("Reset password", error);
            }
        }
    }
}