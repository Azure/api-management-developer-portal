import * as React from "react";
import { useCallback } from "react";
import { Stack } from "@fluentui/react";
import { Body1Strong, Input, Label } from "@fluentui/react-components";
import { BackendService } from "../../../../../services/backendService";
import { BtnSpinner } from "../../../../utils/react/BtnSpinner";
import { HipCaptcha } from "../../../runtime/hip-captcha/react";
import { TCaptchaObj, TOnInitComplete } from "../../../runtime/hip-captcha/react/LegacyCaptcha";

export type TSubmit = (
    password: string,
    newPassword: string,
    passwordConfirmation: string,
    captchaObj: TCaptchaObj,
) => Promise<boolean>;

type ChangePasswordFormProps = {
    requireHipCaptcha: boolean
    backendService: BackendService
    submit: TSubmit
}

export const ChangePasswordForm = ({
    requireHipCaptcha,
    backendService,
    submit,
}: ChangePasswordFormProps) => {
    const [password, setPassword] = React.useState<string>("");
    const [newPassword, setNewPassword] = React.useState<string>("");
    const [passwordConfirmation, setPasswordConfirmation] = React.useState<string>("");
    const [captchaObj, setCaptchaObj] = React.useState<TCaptchaObj>();
    const [isSubmitted, setIsSubmitted] = React.useState(false);

    const handleSubmit = async () => submit(password, newPassword, passwordConfirmation, captchaObj).then(setIsSubmitted);

    const onInitComplete: TOnInitComplete = useCallback((captchaValid, refreshCaptcha, captchaData) => {
        setCaptchaObj({ captchaValid, refreshCaptcha, captchaData });
    }, []);

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
                        placeholder="Enter old password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                    />
                </Stack>
            </Stack.Item>

            <Stack.Item>
                <Stack>
                    <Label required htmlFor="new-password">
                        New password
                    </Label>
                    <Input
                        id="new-password"
                        placeholder="Enter new password"
                        type="password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                    />
                </Stack>
            </Stack.Item>

            <Stack.Item>
                <Stack>
                    <Label required htmlFor="confirm-password">
                        Confirm new password
                    </Label>
                    <Input
                        id="confirm-password"
                        placeholder="Enter new password again"
                        type="password"
                        value={passwordConfirmation}
                        onChange={(event) => setPasswordConfirmation(event.target.value)}
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

            <Stack.Item>
                <BtnSpinner
                    appearance="primary"
                    onClick={handleSubmit}
                >
                    Change
                </BtnSpinner>
            </Stack.Item>
        </Stack>
    )
}
