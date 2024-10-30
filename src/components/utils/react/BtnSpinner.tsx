import * as React from "react";
import { useState } from "react";
import { ButtonProps, Spinner } from "@fluentui/react-components";

export type TProps = ButtonProps & {
    onClick: () => Promise<unknown>;
    working?: boolean;
    className?: string;
};

export const BtnSpinner = ({
    children,
    onClick,
    disabled,
    working: workingProp,
    className
}: TProps) => {
    const [working, setWorking] = useState(false);

    return (
        <button
            disabled={disabled || working || workingProp}
            onClick={() => {
                setWorking(true);
                onClick().finally(() => setWorking(false));
            }}
            className={className}
        >
            {(working || workingProp) && <Spinner size={"extra-tiny"} style={{ marginRight: ".5rem" }} />}
            {children}
        </button>
    );
};
