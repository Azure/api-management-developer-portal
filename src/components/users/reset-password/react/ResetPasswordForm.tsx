import * as React from "react";
import { useCallback } from "react";
import { Stack } from "@fluentui/react";
import { Body1, Body1Strong, Input, Label } from "@fluentui/react-components";
import { HipCaptcha } from "../../runtime/hip-captcha/react";
import { TCaptchaObj, TOnInitComplete } from "../../runtime/hip-captcha/react/LegacyCaptcha";
import { BtnSpinner } from "../../../utils/react/BtnSpinner";
import { BackendService } from "../../../../services/backendService";

export type TSubmit = (
    email: string,
    captchaObj: TCaptchaObj,
) => Promise<boolean>;

type ResetPasswordFormProps = {
    requireHipCaptcha: boolean
    backendService: BackendService
    submit: TSubmit
}

export const ResetPasswordForm = ({
    requireHipCaptcha,
    backendService,
    submit,
}: ResetPasswordFormProps) => {
    const [email, setEmail] = React.useState("");
    const [captchaObj, setCaptchaObj] = React.useState<TCaptchaObj>();
    const [isSubmitted, setIsSubmitted] = React.useState(false);

    const handleSubmit = async () => submit(email, captchaObj).then(setIsSubmitted);

    const onInitComplete: TOnInitComplete = useCallback((captchaValid, refreshCaptcha, captchaData) => {
        setCaptchaObj({ captchaValid, refreshCaptcha, captchaData });
    }, []);

    if (isSubmitted) return (
        <>
            <Body1Strong>Your password reset request was successfully processed</Body1Strong>
            <br />
            <Body1>
                Change password confirmation email is on the way to {email}. Please follow the instructions within the email to continue your password change process.
            </Body1>
        </>
    );

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
                    Request reset
                </BtnSpinner>
            </Stack.Item>
        </Stack>
    )
}
