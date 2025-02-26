import * as React from "react";
import { useCallback } from "react";
import { Stack } from "@fluentui/react";
import { BtnSpinner } from "../../../../utils/react/BtnSpinner";
import { TermsOfUse } from "../../../../utils/react/TermsOfUse";
import { HipCaptcha } from "../../../runtime/hip-captcha/react";
import { BackendService } from "../../../../../services/backendService";
import { TCaptchaObj, TOnInitComplete } from "../../../runtime/hip-captcha/react/LegacyCaptcha";

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
    termsOfUse: string,
    isConsentRequired: boolean
}

export const SignUpForm = ({
    backendService,
    handleSignUp,
    requireHipCaptcha,
    termsEnabled,
    termsOfUse,
    isConsentRequired
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

    if (isSubmitted) return <p id="confirmationMessage">Follow the instructions from the email to verify your account.</p>;


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
                <label htmlFor="passwordConfirm" className="required">Confirm password</label>
                <input
                    id="passwordConfirm"
                    placeholder="Enter confirm password"
                    type="password"
                    className="form-control"
                    value={passwordConfirm}
                    onChange={(event) => setPasswordConfirm(event.target.value)}
                />
            </Stack>
            <Stack className="form-group">
                <label htmlFor="firstName" className="required">First name</label>
                <input
                    id="firstName"
                    placeholder="Enter first name"
                    type="text"
                    className="form-control"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                />
            </Stack>
            <Stack className="form-group">
                <label htmlFor="lastName" className="required">Last name</label>
                <input
                    id="lastName"
                    placeholder="Enter last name"
                    type="text"
                    className="form-control"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                />
            </Stack>

            {requireHipCaptcha && (
                <HipCaptcha
                    backendService={backendService}
                    onInitComplete={onInitComplete}
                />
            )}

            {termsEnabled && termsOfUse && (
                <TermsOfUse
                    termsOfUse={termsOfUse}
                    consented={consented}
                    setConsented={setConsented}
                    isConsentRequired={isConsentRequired}
                />
            )}

            <BtnSpinner
                onClick={submit}
                className="button button-primary"
            >
                Sign up
            </BtnSpinner>
        </>
    );
};
