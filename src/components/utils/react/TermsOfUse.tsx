import * as React from "react";
import { useState } from "react";
import { Checkbox } from "@fluentui/react-components";
import { ChevronDown12Regular, ChevronUp12Regular } from "@fluentui/react-icons";
import { Stack } from "@fluentui/react";

type TTosProps = {
    termsOfUse: string
    consented: boolean
    setConsented: (consented: boolean) => void
    showTermsByDefault?: boolean,
    isConsentRequired?: boolean
}

export const TermsOfUse = ({ termsOfUse, consented, setConsented, showTermsByDefault, isConsentRequired }: TTosProps) => {
    const [showToS, setShowToS] = useState(showTermsByDefault ?? false);

    const tosLabel = (
        <p>
            {isConsentRequired ? <span>I agree to the </span> : <span>Please review </span> }
            <a onClick={() => setShowToS((v) => !v)}>
                Terms of Use{" "}
                {showToS ? <ChevronUp12Regular /> : <ChevronDown12Regular />}
            </a>
        </p>
    );

    return (
        <Stack className="form-group">
            {isConsentRequired ?
                (<Checkbox
                    checked={consented}
                    onChange={(_, { checked }) => setConsented(!!checked)}
                    label={tosLabel}
                />)
            : termsOfUse && (tosLabel)
            }

            {showToS && (<blockquote className="col-md-12">{termsOfUse}</blockquote>)}
        </Stack>
    );
}
