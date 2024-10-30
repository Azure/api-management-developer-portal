import * as React from "react";
import { Stack } from "@fluentui/react";
import { BtnSpinner } from "../../../utils/react/BtnSpinner";

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
                <label htmlFor="confirm-password" className="required">Confirm password</label>
                <input
                    id="confirm-password"
                    placeholder="Enter password again"
                    type="password"
                    className="form-control"
                    value={passwordConfirmation}
                    onChange={(event) => setPasswordConfirmation(event.target.value)}
                />
            </Stack>

            <BtnSpinner
                onClick={handleSubmit}
                className="button button-primary"
            >
                Reset
            </BtnSpinner>
        </>
    )
}
