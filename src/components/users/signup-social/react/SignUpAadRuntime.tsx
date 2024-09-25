import * as React from "react";
import { Stack } from "@fluentui/react";
import { FluentProvider, Input, Label } from "@fluentui/react-components";
import { Router } from "@paperbits/common/routing";
import { Resolve } from "@paperbits/react/decorators";
import { EventManager } from "@paperbits/common/events";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { Logger } from "@paperbits/common/logging";
import * as Constants from "../../../../constants";
import { eventTypes } from "../../../../logging/clientLogger";
import { RouteHelper } from "../../../../routing/routeHelper";
import { Utils } from "../../../../utils";
import { BtnSpinner } from "../../../utils/react/BtnSpinner";
import { TermsOfUse } from "../../../utils/react/TermsOfUse";
import { dispatchErrors, parseAndDispatchError } from "../../validation-summary/utils";
import { ErrorSources } from "../../validation-summary/constants";
import { UsersService } from "../../../../services";
import { ValidationMessages } from "../../validationMessages";
import { validateBasic } from "../../../utils/react/validateBasic";

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

const SignUpAadRuntimeFC = ({ logger, router, routeHelper, signUp, termsOfUse, termsEnabled }: SignUpAadRuntimeFCProps) => {
    const { jwtToken, idToken, provider } = React.useMemo(() => {
        const provider = routeHelper.getIdTokenProvider();
        const idToken = routeHelper.getIdToken();

        if (!provider || !idToken) {
            router.navigateTo(Constants.pageUrlSignIn);
        } else {
            logger.trackEvent(eventTypes.trace, {message: "Signup social component initialized."});
        }

        const jwtToken = idToken ? Utils.parseJwt(idToken) : null;

        return { provider, idToken, jwtToken };
    }, [router, routeHelper, logger]);

    const [firstName, setFirstName] = React.useState<string>(jwtToken?.given_name ?? "");
    const [lastName, setLastName] = React.useState<string>(jwtToken?.family_name ?? "");
    const [email, setEmail] = React.useState<string>((jwtToken?.email || jwtToken?.emails?.[0]) ?? "");
    const [consented, setConsented] = React.useState<boolean>(false);

    return (
        <Stack tokens={{ childrenGap: 20, maxWidth: 435 }}>
            <Stack.Item>
                <Stack>
                    <Label required htmlFor="email">
                        Email address
                    </Label>
                    <Input
                        id="email"
                        placeholder="Enter email address"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />
                </Stack>
            </Stack.Item>

            <Stack.Item>
                <Stack>
                    <Label required htmlFor="firstName">
                        First name
                    </Label>
                    <Input
                        id="firstName"
                        placeholder="Enter first name"
                        type="text"
                        value={firstName}
                        onChange={(event) => setFirstName(event.target.value)}
                    />
                </Stack>
            </Stack.Item>

            <Stack.Item>
                <Stack>
                    <Label required htmlFor="lastName">
                        Last name
                    </Label>
                    <Input
                        id="lastName"
                        placeholder="Enter last name"
                        type="text"
                        value={lastName}
                        onChange={(event) => setLastName(event.target.value)}
                    />
                </Stack>
            </Stack.Item>

            {termsEnabled && termsOfUse && (
                <Stack.Item>
                    <TermsOfUse
                        termsOfUse={termsOfUse}
                        consented={consented}
                        setConsented={setConsented}
                    />
                </Stack.Item>
            )}

            <Stack.Item>
                <BtnSpinner
                    appearance="primary"
                    onClick={() => signUp(provider, idToken, email, firstName, lastName, consented)}
                >
                    Create
                </BtnSpinner>
            </Stack.Item>
        </Stack>
    );
};

export class SignUpAadRuntime extends React.Component<SignUpAadRuntimeProps> {
    @Resolve("eventManager")
    public eventManager: EventManager;

    @Resolve("settingsProvider")
    public settingsProvider: ISettingsProvider;

    @Resolve("usersService")
    public usersService: UsersService;

    @Resolve("logger")
    public logger: Logger;

    @Resolve("routeHelper")
    public routeHelper: RouteHelper;

    @Resolve("router")
    public router: Router;

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
                await this.router.navigateTo(Constants.pageUrlSignIn);
                return;
            }

            await this.usersService.createUserWithOAuth(provider, idToken, firstName, lastName, email);
            await this.router.navigateTo(Constants.pageUrlHome);
        } catch (error) {
            parseAndDispatchError(this.eventManager, ErrorSources.signup, error, this.logger, Constants.genericHttpRequestError);
        }
    }

    render() {
        return (
            <FluentProvider theme={Constants.fuiTheme} style={{ display: "inline" }}>
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