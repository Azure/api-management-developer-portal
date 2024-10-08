import * as React from "react";
import { useState } from "react";
import { Stack } from "@fluentui/react";
import { Input } from "@fluentui/react-components";
import { BtnSpinner } from "../../../utils/react/BtnSpinner";
import { TermsOfUse } from "../../../utils/react/TermsOfUse";

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
            >
                <Stack.Item>
                    <Input
                        value={subscriptionName}
                        onChange={(_, data) => setSubscriptionName(data.value)}
                        placeholder={"Your new product subscription name"}
                        style={{ width: "20em" }}
                    />
                </Stack.Item>
                <Stack.Item>
                    <BtnSpinner
                        onClick={() => subscribe(subscriptionName, consented)}
                        appearance="primary"
                        disabled={!subscriptionName || (termsOfUse && !consented)}
                    >
                        Subscribe
                    </BtnSpinner>
                </Stack.Item>
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
