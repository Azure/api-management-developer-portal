import * as React from "react";
import { useState } from "react";
import { Checkbox, Field, Link, Textarea } from "@fluentui/react-components";
import { ChevronDown12Regular, ChevronUp12Regular } from "@fluentui/react-icons";

type TTosProps = {
    termsOfUse: string
    consented: boolean
    setConsented: (consented: boolean) => void
    showTermsByDefault?: boolean
}

export const TermsOfUse = ({ termsOfUse, consented, setConsented, showTermsByDefault }: TTosProps) => {
    const [showToS, setShowToS] = useState(showTermsByDefault ?? false);

    const tosLabel = (
        <>
            I agree to the{" "}
            <Link as="button" onClick={() => setShowToS((v) => !v)}>
                Terms of Use{" "}
                {showToS ? <ChevronUp12Regular /> : <ChevronDown12Regular />}
            </Link>
        </>
    );

    return (
        <>
            <Checkbox
                checked={consented}
                onChange={(_, { checked }) => setConsented(!!checked)}
                label={tosLabel}
            />

            {showToS && (
                <Field>
                    <Textarea
                        value={termsOfUse}
                        size="small"
                        resize="vertical"
                        textarea={{
                            style: { height: "50vh", maxHeight: "unset" },
                        }}
                    />
                </Field>
            )}
        </>
    );
}
