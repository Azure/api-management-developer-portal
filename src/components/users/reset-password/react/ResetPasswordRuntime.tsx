import * as React from "react";
import { FluentProvider } from "@fluentui/react-components";
import { Resolve } from "@paperbits/react/decorators";
import { EventManager } from "@paperbits/common/events";
import { Logger } from "@paperbits/common/logging";
import * as Constants from "../../../../constants";
import { UsersService } from "../../../../services";
import { BackendService } from "../../../../services/backendService";
import { ResetPasswordForm, TSubmit } from "./ResetPasswordForm";
import { ValidationMessages } from "../../validationMessages";
import { dispatchErrors, parseAndDispatchError } from "../../validation-summary/utils";
import { ErrorSources } from "../../validation-summary/constants";
import { validateBasic } from "../../../utils/react/validateBasic";
import { ResetRequest } from "../../../../contracts/resetRequest";

type ResetPasswordRuntimeProps = {
    requireHipCaptcha: boolean
};

export class ResetPasswordRuntime extends React.Component<ResetPasswordRuntimeProps> {
    @Resolve("usersService")
    public usersService: UsersService;

    @Resolve("eventManager")
    public eventManager: EventManager;

    @Resolve("backendService")
    public backendService: BackendService;

    @Resolve("logger")
    public logger: Logger;

    async componentDidMount() {
        const isUserSignedIn = await this.usersService.isUserSignedIn();

        if (isUserSignedIn) {
            this.usersService.navigateToHome();
            return;
        }
    }

    submit: TSubmit = async (
        email,
        { captchaValid, refreshCaptcha, captchaData } = ({} as any),
    ) => {
        const isCaptchaRequired = this.props.requireHipCaptcha;

        const validationGroup = {
            email: ValidationMessages.emailRequired,
        }

        if (isCaptchaRequired) {
            if (!refreshCaptcha) {
                this.logger.trackEvent("CaptchaValidation", { message: "Captcha failed to initialize." });
                dispatchErrors(this.eventManager, ErrorSources.resetpassword, [ValidationMessages.captchaNotInitialized]);
                return false;
            }

            validationGroup["captchaValid"] = ValidationMessages.captchaRequired;
        }

        const values = { email, captchaValid };
        const clientErrors = validateBasic(values, validationGroup);

        if (clientErrors.length > 0) {
            dispatchErrors(this.eventManager, ErrorSources.resetpassword, clientErrors);
            return false;
        }

        try {
            dispatchErrors(this.eventManager, ErrorSources.resetpassword, []);

            if (isCaptchaRequired) {
                const resetRequest: ResetRequest = {
                    challenge: captchaData.challenge,
                    solution: captchaData.solution?.solution,
                    flowId: captchaData.solution?.flowId,
                    token: captchaData.solution?.token,
                    type: captchaData.solution?.type,
                    email,
                };
                await this.backendService.sendResetRequest(resetRequest);
            } else {
                await this.usersService.createResetPasswordRequest(email);
            }

            return true;
        } catch (error) {
            if (isCaptchaRequired) await refreshCaptcha();

            parseAndDispatchError(this.eventManager, ErrorSources.resetpassword, error, this.logger, undefined, detail => `${detail.target}: ${detail.message} \n`);
            return false;
        }
    }

    render() {
        return (
            <FluentProvider theme={Constants.fuiTheme}>
                <ResetPasswordForm
                    {...this.props}
                    backendService={this.backendService}
                    submit={this.submit.bind(this)}
                />
            </FluentProvider>
        );
    }
}
