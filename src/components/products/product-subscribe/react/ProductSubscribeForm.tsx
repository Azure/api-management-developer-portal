import * as React from "react";
import { useState } from "react";
import { Stack } from "@fluentui/react";
import {
    Button,
    Checkbox,
    Field,
    Input,
    Link,
    Spinner,
    Textarea,
} from "@fluentui/react-components";
import { ChevronDown12Regular, ChevronUp12Regular } from "@fluentui/react-icons";

export type TSubscribe = (
    subscriptionName: string,
    consented: boolean
) => Promise<unknown>;

type Props = {
    subscribe: TSubscribe;
    tos: string | undefined;
    showTermsByDefault: boolean;
};

export const ProductSubscribeForm = ({ subscribe, tos, showTermsByDefault }: Props) => {
    const [subscriptionName, setSubscriptionName] = React.useState("");
    const [consented, setConsented] = useState(false);
    const [showToS, setShowToS] = useState(showTermsByDefault ?? false);
    const [working, setWorking] = useState(false);

    const tosLabel = (
        <>
            I agree to the{" "}
            <Link as="button" onClick={() => setShowToS((v) => !v)}>
                Terms of Use {showToS ? <ChevronUp12Regular /> : <ChevronDown12Regular />}
            </Link>
        </>
    );

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
                    <Button
                        onClick={() => {
                            setWorking(true);
                            subscribe(subscriptionName, consented)
                                .finally(() => setWorking(false));
                        }}
                        appearance="primary"
                        disabled={
                            working || !subscriptionName || (tos && !consented)
                        }
                    >
                        {working && (
                            <Spinner
                                size={"extra-tiny"}
                                style={{ marginRight: ".5rem" }}
                            />
                        )}
                        Subscribe
                    </Button>
                </Stack.Item>
            </Stack>

            {tos && (
                <Checkbox
                    checked={consented}
                    onChange={(_, { checked }) => setConsented(!!checked)}
                    label={tosLabel}
                />
            )}

            {showToS && tos && (
                <Field>
                    <Textarea
                        value={tos}
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
};
