import * as React from "react";
import { Stack } from "@fluentui/react";
import { EventManager } from "@paperbits/common/events";
import { MapiError } from "../../../../errors/mapiError";
import { UnauthorizedError } from "../../../../errors/unauthorizedError";
import { BtnSpinner } from "../../../utils/react/BtnSpinner";
import { validateBasic } from "../../../utils/react/validateBasic";
import { ValidationMessages } from "../../validationMessages";
import { dispatchErrors } from "../../validation-summary/utils";
import { ErrorSources } from "../../validation-summary/constants";

export type THandleSignIn = (email: string, password: string) => Promise<unknown>;

type SignInFormProps = {
    eventManager: EventManager;
    handleSignIn: THandleSignIn;
};

export const SignInForm = ({
    eventManager,
    handleSignIn,
}: SignInFormProps) => {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");

    const submit = async () => {
        const validationRules = {
            email: ValidationMessages.emailRequired,
            password: ValidationMessages.passwordRequired,
        };

        const clientErrors = validateBasic({ email, password }, validationRules);

        if (clientErrors.length > 0) {
            dispatchErrors(eventManager, ErrorSources.signin, clientErrors);
            return;
        }

        try {
            await handleSignIn(email, password);
        } catch (error) {
            if (error instanceof MapiError) {
                if (error.code === "identity_not_confirmed") {
                    const msg = [
                        `We found an unconfirmed account for the e-mail address ${email}. To complete the creation of your account we need to verify your e-mail address. We’ve sent an e-mail to ${email}. Please follow the instructions inside the e-mail to activate your account. If the e-mail doesn’t arrive within the next few minutes, please check your junk email folder`,
                    ];
                    dispatchErrors(eventManager, ErrorSources.signin, msg);
                    return;
                }

                dispatchErrors(eventManager, ErrorSources.signin, [
                    error.message,
                ]);
                return;
            }

            if (error instanceof UnauthorizedError) {
                dispatchErrors(eventManager, ErrorSources.signin, [
                    error.message,
                ]);
                return;
            }

            throw new Error(`Unable to complete signing in. Error: ${error.message}`);
        }
    };

    return (
        <Stack>
            <Stack.Item>
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
            </Stack.Item>

            <Stack.Item>
                <Stack className="form-group">
                    <label htmlFor="password" className="required">Password</label>
                    <input
                        id="password"
                        placeholder="Enter password"
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                    />
                </Stack>
            </Stack.Item>

            <Stack.Item>
                <BtnSpinner
                    onClick={submit}
                    disabled={!email || !password}
                    className="button button-primary"
                >
                    Sign in
                </BtnSpinner>
            </Stack.Item>
        </Stack>
    );
};
