import * as React from "react";
import { Resolve } from "@paperbits/react/decorators";
import { EventManager } from "@paperbits/common/events";
import { Logger } from "@paperbits/common/logging";
import { FluentProvider } from "@fluentui/react-components";
import { UsersService } from "../../../../../services/usersService";
import { BackendService } from "../../../../../services/backendService";
import { ChangePasswordRequest } from "../../../../../contracts/resetRequest";
import { validateBasic } from "../../../../utils/react/validateBasic";
import { ValidationMessages } from "../../../validationMessages";
import { ErrorSources } from "../../../validation-summary/constants";
import { dispatchErrors, parseAndDispatchError } from "../../../validation-summary/utils";
import { fuiTheme } from "../../../../../constants";
import { ChangePasswordForm, TSubmit } from "./ChangePasswordForm";

type ChangePasswordRuntimeProps = {
    requireHipCaptcha: boolean
};

export class ChangePasswordRuntime extends React.Component<ChangePasswordRuntimeProps> {
    @Resolve("usersService")
    public declare usersService: UsersService;

    @Resolve("eventManager")
    public declare eventManager: EventManager;

    @Resolve("backendService")
    public declare backendService: BackendService;

    @Resolve("logger")
    public declare logger: Logger;

    async componentDidMount() {
        const isUserSignedIn = await this.usersService.isUserSignedIn();

        if (!isUserSignedIn) {
            this.usersService.navigateToHome();
            return;
        }
    }

    submit: TSubmit = async (
        password,
        newPassword,
        passwordConfirmation,
        { captchaValid, refreshCaptcha, captchaData } = ({} as any),
    ) => {
        const isCaptchaRequired = this.props.requireHipCaptcha;

        const validationGroup = {
            password: ValidationMessages.passwordRequired,
            newPassword: { required: ValidationMessages.newPasswordRequired, eval: (val) => val === password && ValidationMessages.newPasswordMustBeDifferent },
            passwordConfirmation: { eval: (val) => val !== newPassword && ValidationMessages.passwordConfirmationMustMatch },
        }

        if (isCaptchaRequired) {
            if (!refreshCaptcha) {
                this.logger.trackEvent("CaptchaValidation", { message: "Captcha failed to initialize." });
                dispatchErrors(this.eventManager, ErrorSources.resetpassword, [ValidationMessages.captchaNotInitialized]);
                return false;
            }

            validationGroup["captchaValid"] = ValidationMessages.captchaRequired;
        }

        const values = { password, newPassword, passwordConfirmation, captchaValid };
        const clientErrors = validateBasic(values, validationGroup);

        if (clientErrors.length > 0) {
            dispatchErrors(this.eventManager, ErrorSources.changepassword, clientErrors);
            return false;
        }

        const user = await this.usersService.getCurrentUser();

        if (!user) {
            dispatchErrors(this.eventManager, ErrorSources.changepassword, ["Unable to retrieve user information"]);
            return;
        }

        const credentials = `Basic ${Buffer.from(`${user.email}:${password}`, "utf8").toString("base64")}`;
        let userId = await this.usersService.authenticate(credentials);

        if (!userId) {
            dispatchErrors(this.eventManager, ErrorSources.changepassword, ["Incorrect user name or password"]);
            return;
        }

        userId = `/users/${userId}`;

        try {
            dispatchErrors(this.eventManager, ErrorSources.changepassword, []);

            if (isCaptchaRequired) {
                const changePasswordRequest: ChangePasswordRequest = {
                    challenge: captchaData.challenge,
                    solution: captchaData.solution?.solution,
                    flowId: captchaData.solution?.flowId,
                    token: captchaData.solution?.token,
                    type: captchaData.solution?.type,
                    userId,
                    newPassword
                };
                await this.backendService.sendChangePassword(changePasswordRequest, credentials);
            } else {
                await this.usersService.changePassword(userId, newPassword, credentials);
            }

            return true;
        } catch (error) {
            if (isCaptchaRequired) await refreshCaptcha();

            parseAndDispatchError(this.eventManager, ErrorSources.changepassword, error, this.logger, undefined, detail => `${detail.target}: ${detail.message} \n`);
            return false;
        }
    }

    render() {
        return (
            <FluentProvider theme={fuiTheme}>
                <ChangePasswordForm
                    {...this.props}
                    backendService={this.backendService}
                    submit={this.submit.bind(this)}
                />
            </FluentProvider>
        );
    }
}
