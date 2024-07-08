import * as React from "react";
import { useCallback } from "react";
import { Stack } from "@fluentui/react";
import { Body1, Input, Label } from "@fluentui/react-components";
import { BtnSpinner } from "../../../utils/react/BtnSpinner";
import { TermsOfUse } from "../../../utils/react/TermsOfUse";
import { HipCaptcha } from "../../runtime/hip-captcha/react";
import { BackendService } from "../../../../services/backendService";
import { TCaptchaObj, TOnInitComplete } from "../../runtime/hip-captcha/react/LegacyCaptcha";

export type THandleSignUp = (
    email: string,
    password: string,
    passwordConfirmation: string,
    firstName: string,
    lastName: string,
    consented: boolean,
    captchaObj: TCaptchaObj,
) => Promise<boolean>;

type SignUpFormProps = {
    requireHipCaptcha: boolean
    backendService: BackendService
    handleSignUp: THandleSignUp
    termsEnabled: boolean
    termsOfUse: string
}

export const SignUpForm = ({
    backendService,
    handleSignUp,
    requireHipCaptcha,
    termsEnabled,
    termsOfUse,
}: SignUpFormProps) => {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [passwordConfirm, setPasswordConfirm] = React.useState("");
    const [firstName, setFirstName] = React.useState("");
    const [lastName, setLastName] = React.useState("");
    const [consented, setConsented] = React.useState(false);
    const [captchaObj, setCaptchaObj] = React.useState<TCaptchaObj>();
    const [isSubmitted, setIsSubmitted] = React.useState(false);

    const submit = async () => (
        handleSignUp(email, password, passwordConfirm, firstName, lastName, consented, captchaObj)
            .then(setIsSubmitted)
    );

    const onInitComplete: TOnInitComplete = useCallback((captchaValid, refreshCaptcha, captchaData) => {
        setCaptchaObj({ captchaValid, refreshCaptcha, captchaData });
    }, []);

    if (isSubmitted) return <Body1 id="confirmationMessage">Follow the instructions from the email to verify your account.</Body1>;

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

            <Stack.Item>
                <Stack>
                    <Label required htmlFor="passwordConfirm">
                        Confirm password
                    </Label>
                    <Input
                        id="passwordConfirm"
                        placeholder="Enter confirm password"
                        type="password"
                        value={passwordConfirm}
                        onChange={(event) => setPasswordConfirm(event.target.value)}
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

            {requireHipCaptcha && (
                <Stack.Item>
                    <Label required>Captcha</Label>
                    <HipCaptcha
                        backendService={backendService}
                        onInitComplete={onInitComplete}
                    />
                </Stack.Item>
            )}

            {termsEnabled && termsOfUse && (
                <Stack.Item>
                    <TermsOfUse
                        termsOfUse={termsOfUse}
                        consented={consented}
                        setConsented={setConsented}
                    />
                </Stack.Item>
            )}

            <BtnSpinner
                style={{ maxWidth: "7em" }}
                appearance="primary"
                onClick={submit}
            >
                Create
            </BtnSpinner>
        </Stack>
    );
};
