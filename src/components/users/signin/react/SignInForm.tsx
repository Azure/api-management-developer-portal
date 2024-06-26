import * as React from "react";
import * as validation from "knockout.validation";
import { Stack } from "@fluentui/react";
import { Button, Input, Label, Spinner } from "@fluentui/react-components";
import { EventManager } from "@paperbits/common/events";
import { MapiError } from "../../../../errors/mapiError";
import { UnauthorizedError } from "../../../../errors/unauthorizedError";
import { dispatchErrors } from "../../validation-summary/utils";
import { ErrorSources } from "../../validation-summary/constants";
import { BtnSpinner } from "../../../BtnSpinner";

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

    React.useEffect(() => {
        validation.init({
            insertMessages: false,
            errorElementClass: "is-invalid",
            decorateInputElement: true,
        });
    }, []);

    const submit = async () => {
        const validationGroup = {
            username: email,
            password: password,
        };

        const result = validation.group(validationGroup);

        const clientErrors = result();

        if (clientErrors.length > 0) {
            result.showAllMessages();
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
                    <Label required htmlFor="password">
                        Password
                    </Label>
                    <Input
                        id="password"
                        placeholder="Enter password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                    />
                </Stack>
            </Stack.Item>

            <BtnSpinner
                style={{ maxWidth: "7em" }}
                appearance="primary"
                onClick={submit}
                disabled={!email || !password}
            >
                Sign in
            </BtnSpinner>
        </Stack>
    );
};
