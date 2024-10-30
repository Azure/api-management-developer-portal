import * as React from "react";
import { useCallback } from "react";
import { Stack } from "@fluentui/react";
import { BackendService } from "../../../../services/backendService";
import { BtnSpinner } from "../../../utils/react/BtnSpinner";
import { HipCaptcha } from "../../runtime/hip-captcha/react";
import { TCaptchaObj, TOnInitComplete } from "../../runtime/hip-captcha/react/LegacyCaptcha";

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

    if (isSubmitted)
        return (<p>Your password was successfully updated</p>);

    return (
        <>
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
            <Stack className="form-group">
                <label htmlFor="new-password" className="required">New password</label>
                <input
                    id="new-password"
                    placeholder="Enter new password"
                    type="password"
                    className="form-control"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                />
            </Stack>
            <Stack className="form-group">
                <label htmlFor="confirm-password" className="required">Confirm password</label>
                <input
                    id="confirm-password"
                    placeholder="Enter new password again"
                    type="password"
                    className="form-control"
                    value={passwordConfirmation}
                    onChange={(event) => setPasswordConfirmation(event.target.value)}
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
                Change
            </BtnSpinner>
        </>
    )
}
