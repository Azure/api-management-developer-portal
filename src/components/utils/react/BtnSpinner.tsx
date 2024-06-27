import * as React from "react";
import { useState } from "react";
import { Button, ButtonProps, Spinner } from "@fluentui/react-components";

export type TProps = ButtonProps & {
    onClick: () => Promise<unknown>;
    working?: boolean;
};

export const BtnSpinner = ({
    children,
    onClick,
    disabled,
    working: workingProp,
    ...props
}: TProps) => {
    const [working, setWorking] = useState(false);

    return (
        <Button
            {...props}
            disabled={disabled || working || workingProp}
            onClick={() => {
                setWorking(true);
                onClick().finally(() => setWorking(false));
            }}
        >
            {(working || workingProp) && <Spinner size={"extra-tiny"} style={{ marginRight: ".5rem" }} />}
            {children}
        </Button>
    );
};
