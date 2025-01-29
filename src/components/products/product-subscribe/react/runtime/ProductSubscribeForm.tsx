import * as React from "react";
import { useState } from "react";
import { Stack } from "@fluentui/react";
import { BtnSpinner } from "../../../../utils/react/BtnSpinner";
import { TermsOfUse } from "../../../../utils/react/TermsOfUse";

export type TSubscribe = (
    subscriptionName: string,
    consented: boolean
) => Promise<unknown>;

type Props = {
    subscribe: TSubscribe;
    termsOfUse: string | undefined;
    showTermsByDefault: boolean;
};

export const ProductSubscribeForm = ({ subscribe, termsOfUse, showTermsByDefault }: Props) => {
    const [subscriptionName, setSubscriptionName] = React.useState("");
    const [consented, setConsented] = useState(false);

    return (
        <>
            <Stack
                horizontal
                verticalAlign={"center"}
                tokens={{ childrenGap: 15 }}
                className="form-group"
            >
                <input
                    value={subscriptionName}
                    onChange={(event) => setSubscriptionName(event.target.value)}
                    placeholder={"Your new product subscription name"}
                    className="form-control"
                    style={{ width: "20em" }}
                />
                <BtnSpinner
                    onClick={() => subscribe(subscriptionName, consented)}
                    className="button button-primary"
                    disabled={!subscriptionName || (termsOfUse && !consented)}
                >
                    Subscribe
                </BtnSpinner>
            </Stack>

            {termsOfUse && (
                <TermsOfUse
                    termsOfUse={termsOfUse}
                    consented={consented}
                    setConsented={setConsented}
                    showTermsByDefault={showTermsByDefault}
                />
            )}
        </>
    );
};
