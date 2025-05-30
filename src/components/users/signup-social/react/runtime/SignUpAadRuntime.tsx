import * as React from "react";
import { Stack } from "@fluentui/react";
import { FluentProvider } from "@fluentui/react-components";
import { Router } from "@paperbits/common/routing";
import { Resolve } from "@paperbits/react/decorators";
import { EventManager } from "@paperbits/common/events";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { Logger } from "@paperbits/common/logging";
import { UsersService } from "../../../../../services/usersService";
import { eventTypes } from "../../../../../logging/clientLogger";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { Utils } from "../../../../../utils";
import { BtnSpinner } from "../../../../utils/react/BtnSpinner";
import { TermsOfUse } from "../../../../utils/react/TermsOfUse";
import { validateBasic } from "../../../../utils/react/validateBasic";
import { dispatchErrors, parseAndDispatchError } from "../../../validation-summary/utils";
import { ErrorSources } from "../../../validation-summary/constants";
import { ValidationMessages } from "../../../validationMessages";
import { fuiTheme, genericHttpRequestError, pageUrlHome, pageUrlSignIn } from "../../../../../constants";

type SignUpAadRuntimeProps = {
    termsOfUse: string
    isConsentRequired: boolean
    termsEnabled: boolean
}
type SignUpAadRuntimeFCProps = SignUpAadRuntimeProps & {
    logger: Logger
    router: Router
    routeHelper: RouteHelper
    signUp: (provider: string, idToken: string, email: string, firstName: string, lastName: string, consented: boolean) => Promise<void>
};

const SignUpAadRuntimeFC = ({ logger, router, routeHelper, signUp, termsOfUse, termsEnabled, isConsentRequired }: SignUpAadRuntimeFCProps) => {
    const { jwtToken, idToken, provider } = React.useMemo(() => {
        const provider = routeHelper.getIdTokenProvider();
        const idToken = routeHelper.getIdToken();

        if (!provider || !idToken) {
            router.navigateTo(pageUrlSignIn);
        } else {
            logger.trackEvent(eventTypes.trace, { message: "Signup social component initialized." });
        }

        const jwtToken = idToken ? Utils.parseJwt(idToken) : null;

        return { provider, idToken, jwtToken };
    }, [router, routeHelper, logger]);

    const [firstName, setFirstName] = React.useState<string>(jwtToken?.given_name ?? "");
    const [lastName, setLastName] = React.useState<string>(jwtToken?.family_name ?? "");
    const [email, setEmail] = React.useState<string>((jwtToken?.email || jwtToken?.emails?.[0]) ?? "");
    const [consented, setConsented] = React.useState<boolean>(false);

    return (
        <>
            <Stack className="form-group">
                <label htmlFor="email" className="required">Email address</label>
                <input
                    id="email"
                    placeholder="Enter email address"
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />
            </Stack>
            <Stack className="form-group">
                <label htmlFor="firstName" className="required">First name</label>
                <input
                    id="firstName"
                    placeholder="Enter first name"
                    type="text"
                    className="form-control"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                />
            </Stack>
            <Stack className="form-group">
                <label htmlFor="lastName" className="required">Last name</label>
                <input
                    id="lastName"
                    placeholder="Enter last name"
                    type="text"
                    className="form-control"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                />
            </Stack>

            {termsEnabled && termsOfUse && (
                <TermsOfUse
                    termsOfUse={termsOfUse}
                    consented={consented}
                    setConsented={setConsented}
                    isConsentRequired={isConsentRequired}
                />
            )}

            <BtnSpinner
                className="button button-primary"
                onClick={() => signUp(provider, idToken, email, firstName, lastName, consented)}
            >
                Sign up
            </BtnSpinner>
        </>
    );
};

export class SignUpAadRuntime extends React.Component<SignUpAadRuntimeProps> {
    @Resolve("eventManager")
    public declare eventManager: EventManager;

    @Resolve("settingsProvider")
    public declare settingsProvider: ISettingsProvider;

    @Resolve("usersService")
    public declare usersService: UsersService;

    @Resolve("logger")
    public declare logger: Logger;

    @Resolve("routeHelper")
    public declare routeHelper: RouteHelper;

    @Resolve("router")
    public declare router: Router;

    public async signUp(provider: string, idToken: string, email: string, firstName: string, lastName: string, consented: boolean): Promise<void> {
        const validationGroup = {
            email: ValidationMessages.emailRequired,
            firstName: ValidationMessages.firstNameRequired,
            lastName: ValidationMessages.lastNameRequired,
        }

        if (this.props.termsEnabled && this.props.isConsentRequired) {
            validationGroup["consented"] = ValidationMessages.consentRequired;
        }

        const values = { email, firstName, lastName, consented };
        const clientErrors = validateBasic(values, validationGroup);

        if (clientErrors.length > 0) {
            dispatchErrors(this.eventManager, ErrorSources.signup, clientErrors);
            return;
        }

        dispatchErrors(this.eventManager, ErrorSources.signup, []);
        try {
            if (!provider || !idToken) {
                await this.router.navigateTo(pageUrlSignIn);
                return;
            }

            await this.usersService.createUserWithOAuth(provider, idToken, firstName, lastName, email);
            await this.router.navigateTo(pageUrlHome);
        } catch (error) {
            parseAndDispatchError(this.eventManager, ErrorSources.signup, error, this.logger, genericHttpRequestError);
        }
    }

    render() {
        return (
            <FluentProvider theme={fuiTheme}>
                <SignUpAadRuntimeFC
                    {...this.props}
                    logger={this.logger}
                    router={this.router}
                    routeHelper={this.routeHelper}
                    signUp={this.signUp.bind(this)}
                />
            </FluentProvider>
        );
    }
}
