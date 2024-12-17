import * as React from "react";
import { useEffect, useState } from "react";
import { Stack } from "@fluentui/react";
import { Body1Strong, Button, Dropdown, Field, Input, Label, Option, Tooltip } from "@fluentui/react-components";
import { AddCircleRegular, ChevronUp20Regular, DeleteRegular } from "@fluentui/react-icons";
import { ConsoleHeader } from "../../../../../../models/console/consoleHeader";
import { getValidationMessage, getValidationState } from "./consoleUtils";

type ConsoleHeadersProps = {
    headers: ConsoleHeader[];
    updateHeaders: (headers: ConsoleHeader[]) => void;
    isGqlConsole?: boolean;
}

export const ConsoleHeaders = ({ headers, updateHeaders, isGqlConsole }: ConsoleHeadersProps) => {
    const [isHeadersCollapsed, setIsHeadersCollapsed] = useState<boolean>(headers?.length === 0);
    const [consoleHeaders, setConsoleHeaders] = useState<ConsoleHeader[]>(headers);

    useEffect(() => {
        setConsoleHeaders(headers);
        setIsHeadersCollapsed(headers?.length === 0);
    }, [headers]);

    useEffect(() => {
        updateHeaders(consoleHeaders);
    }, [consoleHeaders]);

    const addHeader = (): void => {
        const newHeader = new ConsoleHeader();
        consoleHeaders.push(newHeader);
        setConsoleHeaders([...consoleHeaders]);
        isHeadersCollapsed && setIsHeadersCollapsed(false);
    }

    const removeHeader = (header: ConsoleHeader): void => {
        consoleHeaders.remove(header);
        setConsoleHeaders([...consoleHeaders]);
        consoleHeaders.length === 0 && setIsHeadersCollapsed(true);
    }

    const changeHeader = (headerId: string, fieldName: string, newValue: string): void => {
        const newHeaders: ConsoleHeader[] = consoleHeaders.map(header => {
            if (header.id === headerId) {
                fieldName === "name" ? header.name(newValue) : fieldName === "value" && header.value(newValue);
            }
            return header;
        });
        setConsoleHeaders([...newHeaders]);
    }

    const renderHeaders = () => (
        <>
            {consoleHeaders.map(header => (
                <Stack horizontal verticalAlign="center" key={header.id} className="param-detail">
                    <div className={"param-name"}>
                        {header.required
                            ? <Label htmlFor={`header-dropdown-${header.id}`} className={header.required ? "required" : ""}>{header.name()}</Label>
                            : <Input
                                type="text"
                                placeholder="Enter header name"
                                value={header.name() ?? ""}
                                onChange={(_, data) => changeHeader(header.id, "name", data.value)}
                                />
                        }
                    </div>
                    <div className={"param-value"}>
                        <Field validationState={getValidationState(header)} validationMessage={getValidationMessage(header)}>
                        {header.options.length > 0 ?
                            <Dropdown
                                id={`header-dropdown-${header.id}`}
                                value={header.value()}
                                selectedOptions={[header.value()]}
                                placeholder={`Select ${header.name()} value`}
                                onOptionSelect={(_, data) => changeHeader(header.id, "value", data.optionValue)}
                            >
                                {header.options.map(option => (
                                    <Option key={option} value={option}>{option}</Option>
                                ))}
                            </Dropdown> :
                            <Input
                                type={header.secret() ? "password" : "text"}
                                placeholder="Enter header value"
                                value={header.value() ?? ""}
                                onChange={(_, data) => changeHeader(header.id, "value", data.value)}
                            />
                        }
                        </Field>
                    </div>
                    <div className={"param-remove"}>
                        {!header.required &&
                            <Tooltip content="Remove header" relationship="label">
                                <Button icon={<DeleteRegular />} appearance="subtle" onClick={() => removeHeader(header)} />
                            </Tooltip>
                        }
                    </div>
                </Stack>
            ))}
        </>
    );

    if (isGqlConsole) return (
        <>
            {renderHeaders()}
            <Button appearance="subtle" icon={<AddCircleRegular />} onClick={() => addHeader()}>Add header</Button>
        </>
    );

    return (
        <div className={"operation-table"}>
            <div className={"operation-table-header"}>
                <Stack horizontal verticalAlign="center" horizontalAlign="space-between">
                    <Stack horizontal verticalAlign="center">
                        <ChevronUp20Regular
                            onClick={() => setIsHeadersCollapsed(!isHeadersCollapsed)}
                            className={`collapse-button${isHeadersCollapsed ? " is-collapsed" : ""}`}
                        />
                        <Body1Strong>Headers</Body1Strong>
                    </Stack>
                    <Button icon={<AddCircleRegular />} onClick={() => addHeader()}>Add header</Button>
                </Stack>
            </div>
            {!isHeadersCollapsed && consoleHeaders?.length > 0 &&
                <div className={"operation-table-body-console"}>
                    {renderHeaders()}
                </div>
            }
        </div>
    );
}