import * as React from "react";
import { useEffect, useState } from "react";
import * as validation from "knockout.validation";
import { FluentProvider, Spinner } from "@fluentui/react-components";
import { Resolve } from "@paperbits/react/decorators";
import { Router } from "@paperbits/common/routing";
import { Logger } from "@paperbits/common/logging";
import { EventManager } from "@paperbits/common/events";
import * as Constants from "../../../../constants";
import { UsersService } from "../../../../services";
import { RouteHelper } from "../../../../routing/routeHelper";
import { Utils } from "../../../../utils";
import { SignUpForm, THandleSignUp } from "./SignUpForm";
import { dispatchErrors, parseAndDispatchError } from "../../validation-summary/utils";
import { ErrorSources } from "../../validation-summary/constants";
import { ValidationMessages } from "../../validationMessages";
import { MapiSignupRequest, SignupRequest } from "../../../../contracts/signupRequest";
import { BackendService } from "../../../../services/backendService";

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

const ProductSubscribeRuntimeFC = ({ backendService, usersService, eventManager, handleSignUp, router, delegationUrl, ...props }: SignUpRuntimeFCProps) => {
    const [working, setWorking] = useState(true);

    useEffect(() => {
        setWorking(true);
        initUser(usersService, router, delegationUrl)
            .finally(() => setWorking(false));
    }, [usersService, delegationUrl]);

    if (working) return <Spinner label={"Loading current user"} labelPosition="below" />;

    console.log(props)

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

    handleSignUp: THandleSignUp = async (email, password, passwordConfirmation, firstName, lastName, consented, captchaData) => {
        const captchaIsRequired = this.props.requireHipCaptcha;

        const validationGroup = {
            email,
            password,
            passwordConfirmation,
            firstName,
            lastName,
            captchaData,
        };
/*
        if (captchaIsRequired) {
            if (!this.setCaptchaValidation) {
                logger.trackEvent("CaptchaValidation", { message: "Captcha failed to initialize." });
                dispatchErrors(this.eventManager, ErrorSources.resetpassword, [ValidationMessages.captchaNotInitialized]);
                return;
            }

            validationGroup["captcha"] = this.captcha;
            this.setCaptchaValidation(this.captcha);
        }
*/
        if (this.props.termsEnabled && this.props.isConsentRequired) {
            validationGroup["consented"] = consented;
        }

        const result = validation.group(validationGroup);

        const clientErrors = result();

        if (clientErrors.length > 0) {
            result.showAllMessages();
            dispatchErrors(this.eventManager, ErrorSources.signup, clientErrors);
            return;
        }

        const mapiSignupData: MapiSignupRequest = {
            email,
            firstName,
            lastName,
            password,
            confirmation: "signup",
            appType: Constants.AppType
        };

        try {
            // this.working(true);
            dispatchErrors(this.eventManager, ErrorSources.signup, []);
/*
            if (captchaIsRequired) {
                const captchaRequestData = this.captchaData();
                const createSignupRequest: SignupRequest = {
                    challenge: captchaRequestData.challenge,
                    solution: captchaRequestData.solution?.solution,
                    flowId: captchaRequestData.solution?.flowId,
                    token: captchaRequestData.solution?.token,
                    type: captchaRequestData.solution?.type,
                    signupData: mapiSignupData
                };

                await this.backendService.sendSignupRequest(createSignupRequest);
            } else {
                await this.usersService.createSignupRequest(mapiSignupData);
            }

            this.isUserRequested(true);*/
        } catch (error) {
            if (captchaIsRequired) {
//                await this.refreshCaptcha();
            }

            parseAndDispatchError(this.eventManager, ErrorSources.signup, error, this.logger, Constants.genericHttpRequestError);
        }
    }

    render() {
        return (
            <FluentProvider theme={Constants.fuiTheme}>
                <ProductSubscribeRuntimeFC
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
