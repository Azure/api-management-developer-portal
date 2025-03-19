import * as React from "react";
import { useEffect, useState } from "react";
import { FluentProvider, Spinner } from "@fluentui/react-components";
import { Resolve } from "@paperbits/react/decorators";
import { Router } from "@paperbits/common/routing";
import { Logger } from "@paperbits/common/logging";
import { EventManager } from "@paperbits/common/events";
import { UsersService } from "../../../../../services";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { dispatchErrors, parseAndDispatchError } from "../../../validation-summary/utils";
import { ErrorSources } from "../../../validation-summary/constants";
import { ValidationMessages } from "../../../validationMessages";
import { MapiSignupRequest, SignupRequest } from "../../../../../contracts/signupRequest";
import { BackendService } from "../../../../../services/backendService";
import { validateBasic } from "../../../../utils/react/validateBasic";
import { AppType, fuiTheme, genericHttpRequestError } from "../../../../../constants";
import { SignUpForm, THandleSignUp } from "./SignUpForm";

type SignUpRuntimeProps = {
    requireHipCaptcha: boolean
    delegationUrl: string
    termsEnabled: boolean
    termsOfUse: string
    isConsentRequired: boolean
}
type SignUpRuntimeFCProps = SignUpRuntimeProps & {
    backendService: BackendService
    usersService: UsersService
    eventManager: EventManager
    handleSignUp: THandleSignUp
    router: Router
};

const initUser = async (usersService: UsersService, router: Router, redirectUrl: string) => {
    try {
        const isUserSignedIn = await usersService.isUserSignedIn();
        if (isUserSignedIn) {
            usersService.navigateToHome();
            return;
        }

        const queryParams = new URLSearchParams(location.search);

        if (queryParams.has("userid") && queryParams.has("ticketid") && queryParams.has("ticket")) {
            await usersService.activateUser(queryParams);

            const userId = await usersService.getCurrentUserId();

            if (!userId) {
                console.error("Activate user error: User not found.");
            } else {
                usersService.navigateToHome();
            }
        } else {
            if (redirectUrl) {
                await router.navigateTo(redirectUrl);
            }
        }
    } catch (error) {
        if (error.code === "Unauthorized" || error.code === "ResourceNotFound") return;

        throw error;
    }
};

const SignUpRuntimeFC = ({ backendService, usersService, eventManager, handleSignUp, router, delegationUrl, ...props }: SignUpRuntimeFCProps) => {
    const [working, setWorking] = useState(true);

    useEffect(() => {
        setWorking(true);
        initUser(usersService, router, delegationUrl)
            .finally(() => setWorking(false));
    }, [usersService, delegationUrl]);

    if (working) return <Spinner label={"Loading current user..."} labelPosition="below" size="small" />;

    return (
        <SignUpForm
            {...props}
            backendService={backendService}
            handleSignUp={handleSignUp}
        />
    );
};

export class SignUpRuntime extends React.Component<SignUpRuntimeProps> {
    @Resolve("backendService")
    public backendService: BackendService;

    @Resolve("usersService")
    public usersService: UsersService;

    @Resolve("eventManager")
    public eventManager: EventManager;

    @Resolve("routeHelper")
    public routeHelper: RouteHelper;

    @Resolve("router")
    public router: Router;

    @Resolve("logger")
    public logger: Logger;

    handleSignUp: THandleSignUp = async (
        email,
        password,
        passwordConfirmation,
        firstName,
        lastName,
        consented,
        { captchaValid, refreshCaptcha, captchaData } = ({} as any),
    ) => {
        const isCaptchaRequired = this.props.requireHipCaptcha;

        const validationGroup = {
            email: ValidationMessages.emailRequired,
            password: { required: ValidationMessages.passwordRequired, eval: (val) => val.length < 8 && "Password should be at least 8 characters long." }, // TODO for self-hosted: password requirements should come from Management API.
            passwordConfirmation: { eval: (val) => val !== password && ValidationMessages.passwordConfirmationMustMatch },
            firstName: ValidationMessages.firstNameRequired,
            lastName: ValidationMessages.lastNameRequired,
        }

        if (isCaptchaRequired) {
            if (!refreshCaptcha) {
                this.logger.trackEvent("CaptchaValidation", { message: "Captcha failed to initialize." });
                dispatchErrors(this.eventManager, ErrorSources.resetpassword, [ValidationMessages.captchaNotInitialized]);
                return false;
            }

            validationGroup["captchaValid"] = ValidationMessages.captchaRequired;
        }

        if (this.props.termsEnabled && this.props.isConsentRequired) {
            validationGroup["consented"] = ValidationMessages.consentRequired;
        }

        const values = { email, password, passwordConfirmation, firstName, lastName, captchaValid, consented };
        const clientErrors = validateBasic(values, validationGroup);

        if (clientErrors.length > 0) {
            dispatchErrors(this.eventManager, ErrorSources.signup, clientErrors);
            return false;
        }

        const mapiSignupData: MapiSignupRequest = {
            email,
            firstName,
            lastName,
            password,
            confirmation: "signup",
            appType: AppType
        };

        try {
            dispatchErrors(this.eventManager, ErrorSources.signup, []);

            if (isCaptchaRequired) {
                const createSignupRequest: SignupRequest = {
                    challenge: captchaData.challenge,
                    solution: captchaData.solution?.solution,
                    flowId: captchaData.solution?.flowId,
                    token: captchaData.solution?.token,
                    type: captchaData.solution?.type,
                    signupData: mapiSignupData
                };

                await this.backendService.sendSignupRequest(createSignupRequest);
            } else {
                await this.usersService.createSignupRequest(mapiSignupData);
            }

            return true;
        } catch (error) {
            if (isCaptchaRequired) await refreshCaptcha();

            parseAndDispatchError(this.eventManager, ErrorSources.signup, error, this.logger, genericHttpRequestError);
            return false;
        }
    }

    render() {
        return (
            <FluentProvider theme={fuiTheme}>
                <SignUpRuntimeFC
                    {...this.props}
                    backendService={this.backendService}
                    usersService={this.usersService}
                    eventManager={this.eventManager}
                    router={this.router}
                    handleSignUp={this.handleSignUp.bind(this)}
                />
            </FluentProvider>
        );
    }
}
