import * as React from "react";
import { Button, Input, Spinner } from "@fluentui/react-components";
import { SaveRegular } from "@fluentui/react-icons";

export type TValueOrFieldProps<T> = React.PropsWithChildren<{
    isEdit: boolean;
    value?: T;
    setValue: (value: T) => void;
    inputProps?: React.ComponentProps<typeof Input>;
}>;

export const ValueOrField = ({
    isEdit,
    value,
    setValue,
    children,
    inputProps,
}: TValueOrFieldProps<string>) => {
    if (!isEdit) return <>{children ?? value}</>;

    return (
        <Input
            value={value}
            onChange={(_, data) => setValue(data.value)}
            {...inputProps}
        />
    );
};

type TValueOrFieldWBtnProps = Omit<
    TValueOrFieldProps<string>,
    "setValue"
> & {
    save: (value: string) => Promise<unknown>;
};

export const ValueOrFieldWBtn = ({
    save,
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
            isEdit={isEdit}
            value={value}
            setValue={setValue}
            inputProps={{
                style: { width: "100%", ...inputProps?.style },
                size: "small",
                contentAfter: working ? (
                    <Spinner size={"extra-tiny"} />
                ) : (
                    <Button
                        size="small"
                        appearance="transparent"
                        onClick={onSave}
                        icon={<SaveRegular />}
                    />
                ),
                ...inputProps,
            }}
        >
            {children}
        </ValueOrField>
    );
};
