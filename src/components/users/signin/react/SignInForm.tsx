import * as React from "react";
import * as validation from "knockout.validation";
import { Stack } from "@fluentui/react";
import { Button, Input, Label, Spinner } from "@fluentui/react-components";
import { Router } from "@paperbits/common/routing";
import { EventManager } from "@paperbits/common/events";
import { UsersService } from "../../../../services";
import { Utils } from "../../../../utils";
import { MapiError } from "../../../../errors/mapiError";
import { UnauthorizedError } from "../../../../errors/unauthorizedError";
import { RouteHelper } from "../../../../routing/routeHelper";
import { dispatchErrors } from "../../validation-summary/utils";
import { ErrorSources } from "../../validation-summary/constants";

type SignInFormProps = {
    usersService: UsersService;
    eventManager: EventManager;
    router: Router;
    routeHelper: RouteHelper;
};

export const SignInForm = ({
    usersService,
    eventManager,
    router,
    routeHelper,
}: SignInFormProps) => {
    const [working, setWorking] = React.useState(false);
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
        let errorMessages = [];

        const validationGroup = {
            username: email,
            password: password,
        };

        const result = validation.group(validationGroup);

        const clientErrors = result();

        if (clientErrors.length > 0) {
            result.showAllMessages();
            dispatchErrors(eventManager, ErrorSources.signin, clientErrors);
            errorMessages = clientErrors;
            return;
        }

        try {
            setWorking(true);

            await usersService.signInWithBasic(email, password);

            const clientReturnUrl = sessionStorage.getItem("returnUrl");
            const returnUrl =
                routeHelper.getQueryParameter("returnUrl") || clientReturnUrl;

            if (returnUrl) {
                await router.navigateTo(Utils.sanitizeReturnUrl(returnUrl));
                return;
            }

            usersService.navigateToHome();
        } catch (error) {
            if (error instanceof MapiError) {
                if (error.code === "identity_not_confirmed") {
                    const msg = [
                        `We found an unconfirmed account for the e-mail address ${email}. To complete the creation of your account we need to verify your e-mail address. We’ve sent an e-mail to ${email}. Please follow the instructions inside the e-mail to activate your account. If the e-mail doesn’t arrive within the next few minutes, please check your junk email folder`,
                    ];
                    dispatchErrors(eventManager, ErrorSources.signin, msg);
                    return;
                }

                errorMessages = [error.message];
                dispatchErrors(eventManager, ErrorSources.signin, [
                    error.message,
                ]);
                return;
            }

            if (error instanceof UnauthorizedError) {
                errorMessages = [error.message];
                dispatchErrors(eventManager, ErrorSources.signin, [
                    error.message,
                ]);
                return;
            }

            throw new Error(
                `Unable to complete signing in. Error: ${error.message}`
            );
        } finally {
            setWorking(false);
        }
    };

    return (
        <Stack tokens={{ childrenGap: 20, maxWidth: 400 }}>
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

            <Button
                style={{ maxWidth: "7em" }}
                appearance="primary"
                onClick={submit}
                disabled={!email || !password || working}
            >
                {working && (
                    <Spinner
                        size={"extra-tiny"}
                        style={{ marginRight: ".5rem" }}
                    />
                )}
                Sign in
            </Button>
        </Stack>
    );
};
