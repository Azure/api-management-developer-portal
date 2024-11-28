import * as React from "react";
import { useCallback } from "react";
import { Stack } from "@fluentui/react";
import { HipCaptcha } from "../../../runtime/hip-captcha/react";
import { TCaptchaObj, TOnInitComplete } from "../../../runtime/hip-captcha/react/LegacyCaptcha";
import { BtnSpinner } from "../../../../utils/react/BtnSpinner";
import { BackendService } from "../../../../../services/backendService";

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
            <p>Your password reset request was successfully processed</p>
            <p>Change password confirmation email is on the way to {email}. Please follow the instructions within the email to continue your password change process.</p>
        </>
    );

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

            {requireHipCaptcha && (
                <HipCaptcha
                    backendService={backendService}
                    onInitComplete={onInitComplete}
                />
            )}

            <BtnSpinner
                onClick={handleSubmit}
                className="button button-primary"
            >
                Request reset
            </BtnSpinner>
        </>
    )
}
