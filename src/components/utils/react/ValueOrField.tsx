import * as React from "react";
import { Button, Spinner } from "@fluentui/react-components";
import { DismissRegular, SaveRegular } from "@fluentui/react-icons";
import { Stack } from "@fluentui/react";

export type TValueOrFieldProps<T> = React.PropsWithChildren<{
    enableSave: boolean;
    working?: boolean;
    onSave?: () => void;
    onCancel?: () => void;
    isEdit: boolean;
    value?: T;
    setValue: (value: T) => void;
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}>;

export const ValueOrField = ({
    enableSave,
    working,
    onSave,
    onCancel,
    isEdit,
    value,
    setValue,
    children,
    inputProps,
}: TValueOrFieldProps<string>) => {
    if (!isEdit) return <>{children ?? value}</>;

    return (
        <Stack horizontal className="form-group" style={{ margin: 0 }}>
            <input
                style={inputProps?.style}
                className="form-control"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                {...inputProps}
            />
            {working ?
                (<Spinner size={"extra-tiny"} />)
                :
                (enableSave &&
                    <>
                        <Button
                            size="small"
                            appearance="transparent"
                            aria-label="Save"
                            onClick={onSave}
                            icon={<SaveRegular />}
                        />
                        <Button
                            size="small"
                            icon={<DismissRegular />}
                            appearance="transparent"
                            aria-label="Cancel"
                            onClick={onCancel}
                            disabled={working}
                        />
                    </>
            )}
        </Stack>
    );
};

type TValueOrFieldWBtnProps = Omit<
    TValueOrFieldProps<string>,
    "setValue" | "enableSave" | "working" | "onSave" | "onCancel"
> & {
    save: (value: string) => Promise<unknown>;
    cancel: () => void;
};

export const ValueOrFieldWBtn = ({
    save,
    cancel,
    isEdit,
    value: valueDefault,
    children,
    inputProps,
}: TValueOrFieldWBtnProps) => {
    const [working, setWorking] = React.useState(false);
    const [value, setValue] = React.useState(valueDefault);

    const onSave = () => {
        setWorking(true);
        save(value)
        .finally(() => setWorking(false));
    };

    return (
        <ValueOrField
            enableSave={true}
            working={working}
            onSave={onSave}
            onCancel={() => cancel()}
            isEdit={isEdit}
            value={value}
            setValue={setValue}
            inputProps={inputProps}
        >
            {children}
        </ValueOrField>
    );
};
