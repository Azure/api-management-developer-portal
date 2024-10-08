import * as React from "react";
import { Stack } from "@fluentui/react";
import { Body1Strong, Input, Label } from "@fluentui/react-components";
import { BtnSpinner } from "../../../../utils/react/BtnSpinner";

export type TSubmit = (
    password: string,
    passwordConfirmation: string,
) => Promise<boolean>;

type ChangePasswordFormProps = {
    submit: TSubmit
}

export const ConfirmPasswordForm = ({ submit }: ChangePasswordFormProps) => {
    const [password, setPassword] = React.useState<string>("");
    const [passwordConfirmation, setPasswordConfirmation] = React.useState<string>("");
    const [isSubmitted, setIsSubmitted] = React.useState(false);

    const handleSubmit = async () => submit(password, passwordConfirmation).then(setIsSubmitted);

    if (isSubmitted) return (
        <>
            <Body1Strong>Your password was successfully updated</Body1Strong>
        </>
    );

    return (
        <Stack tokens={{ childrenGap: 20, maxWidth: 435 }}>
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
                    <Label required htmlFor="confirm-password">
                        Confirm password
                    </Label>
                    <Input
                        id="confirm-password"
                        placeholder="Enter password again"
                        type="password"
                        value={passwordConfirmation}
                        onChange={(event) => setPasswordConfirmation(event.target.value)}
                    />
                </Stack>
            </Stack.Item>

            <Stack.Item>
                <BtnSpinner
                    appearance="primary"
                    onClick={handleSubmit}
                >
                    Reset
                </BtnSpinner>
            </Stack.Item>
        </Stack>
    )
}
