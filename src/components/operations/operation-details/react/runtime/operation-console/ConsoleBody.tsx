import * as React from "react";
import { useEffect, useState } from "react";
import { Stack } from "@fluentui/react";
import { Body1Strong, Button, Dropdown, Field, Input, Label, Option, Radio, RadioGroup, Textarea, Tooltip } from "@fluentui/react-components";
import { AddCircleRegular, ArrowClockwiseRegular, ChevronUp20Regular, DeleteRegular } from "@fluentui/react-icons";
import { ConsoleRepresentation } from "../../../../../../models/console/consoleRepresentation";
import { RequestBodyType } from "../../../../../../constants";
import { BinaryField } from "./BinaryField";

type ConsoleBodyProps = {
    hasBody: boolean;
    body: string;
    binary: File;
    bodyDataItems: any[];
    bodyFormat: RequestBodyType;
    readonlyBodyFormat: boolean;
    representations: ConsoleRepresentation[];
    updateHasBody: (hasBody: boolean) => void;
    updateBody: (body: string) => void;
    updateBodyBinary: (file: File) => void;
    updateBodyFormat: (format: RequestBodyType) => void;
}

export const ConsoleBody = ({
    hasBody,
    body,
    binary,
    bodyDataItems,
    bodyFormat,
    readonlyBodyFormat,
    representations,
    updateHasBody,
    updateBody,
    updateBodyBinary,
    updateBodyFormat
}: ConsoleBodyProps) => {
    const [isBodyCollapsed, setIsBodyCollapsed] = useState<boolean>(!hasBody);
    const [file, setFile] = useState<File>(binary);
    const [bodyFormatState, setBodyFormatState] = useState<RequestBodyType>(bodyFormat ?? RequestBodyType.raw);
    const [selectedRepresentation, setSelectedRepresentation] = useState<ConsoleRepresentation>(representations?.[0] ?? null);
    const [selectedRepresentationId, setSelectedRepresentationId] = useState<string>(selectedRepresentation?.typeName + "+" + selectedRepresentation?.contentType ?? "");
    const [initialBody, setInitialBody] = useState<string>(selectedRepresentation?.sample ?? "");
    const [isBodyEdited, setIsBodyEdited] = useState<boolean>(
        (bodyFormat === RequestBodyType.raw && body !== initialBody) || (bodyFormat === RequestBodyType.binary && binary !== null) || false
    );

    useEffect(() => {
        setFile(binary);
        setBodyFormatState(bodyFormat);
        setSelectedRepresentation(representations[0] ?? null);
        setSelectedRepresentationId(representations[0]?.typeName + "+" + representations[0]?.contentType ?? "");
        setInitialBody(representations[0]?.sample ?? "");
    }, [binary, bodyFormat, representations]);

    const addBody = (): void => {
        setIsBodyCollapsed(false);
        updateHasBody(true);
        updateBody(initialBody);
        updateBodyFormat(RequestBodyType.raw);
    }

    const removeBody = (): void => {
        setIsBodyCollapsed(true);        
        setIsBodyEdited(false);
        updateHasBody(false);
        updateBody("");
        updateBodyBinary(null);
        updateBodyFormat(RequestBodyType.raw);
    }

    const uploadFile = (file: File): void => {
        setIsBodyEdited(true);
        updateBodyBinary(file);
        updateBodyFormat(RequestBodyType.binary);
    }

    const selectRepresentation = (representationId: string): void => {
        const representationNameAndType = representationId.split("+");
        const selectedRep = representations.find(representation =>
            representation.typeName === representationNameAndType[0] && representation.contentType === representationNameAndType[1]
        );
        setSelectedRepresentationId(representationId);
        setSelectedRepresentation(selectedRep);
        setInitialBody(selectedRep.sample ?? "");
        updateBody(selectedRep.sample ?? "");
    }

    return (
        <div className={"operation-table"}>
            <div className={"operation-table-header"}>
                <Stack horizontal verticalAlign="center" horizontalAlign="space-between">
                    <Stack horizontal verticalAlign="center">
                        <ChevronUp20Regular
                            onClick={() => setIsBodyCollapsed(!isBodyCollapsed)}
                            className={`collapse-button${isBodyCollapsed ? " is-collapsed" : ""}`}
                        />
                        <Body1Strong>Body</Body1Strong>
                    </Stack>
                    {hasBody
                        ? <Tooltip content="Remove body" relationship="label">
                            <Button icon={<DeleteRegular />} appearance="subtle" onClick={() => removeBody()} />
                        </Tooltip>
                        : <Button icon={<AddCircleRegular />} onClick={() => addBody()}>Add body</Button>
                    }
                </Stack>
            </div>
            {(!isBodyCollapsed && hasBody) &&
                <div className={"operation-table-body-console"}>
                    <Stack horizontal verticalAlign="center">
                        <Stack.Item className="format-selection">
                            <RadioGroup
                                name={"Request body format"}
                                value={bodyFormatState}
                                layout="horizontal"
                                onChange={(_, data) => setBodyFormatState(data.value as RequestBodyType)}
                            >
                                {readonlyBodyFormat && <Radio value={RequestBodyType.form} label={"Form-data"} disabled />}
                                <Radio value={RequestBodyType.raw} label={"Raw"} disabled={readonlyBodyFormat} />
                                <Radio value={RequestBodyType.binary} label={"Binary"} disabled={readonlyBodyFormat} />
                            </RadioGroup>
                        </Stack.Item>
                        {bodyFormatState === RequestBodyType.raw && representations.length > 0 &&
                            <Stack.Item grow>
                                <Dropdown
                                    aria-label="Sample request body"
                                    placeholder="Select sample request body"
                                    className="request-body-dropdown"
                                    value={selectedRepresentation.typeName}
                                    selectedOptions={[selectedRepresentationId]}
                                    onOptionSelect={(_, data) => selectRepresentation(data.optionValue)}
                                >
                                    {representations.map(representation => {
                                        const repId = representation.typeName + "+" + representation.contentType;
                                        return <Option key={repId} value={repId}>{representation.typeName}</Option>;
                                    })}
                                </Dropdown>
                            </Stack.Item>
                        }
                    </Stack>
                    {readonlyBodyFormat
                        ? bodyDataItems?.map(dataItem =>
                            <Stack key={dataItem.name()}>
                                <Label htmlFor={dataItem.name()}>{dataItem.name()} (type: {dataItem.type()})</Label>
                                {dataItem.bodyFormat() === "string"
                                    ? <Input id={dataItem.name()} type="text" value={dataItem.body()} />
                                    : dataItem.bodyFormat() === RequestBodyType.raw
                                        ? <Textarea
                                            id={dataItem.name()}
                                            resize="vertical"
                                            value={dataItem.body()}
                                          />
                                        : dataItem.bodyFormat() === RequestBodyType.binary
                                            && <BinaryField
                                                fileName={dataItem.name()}
                                                updateBinary={(file) => uploadFile(file)}
                                            />
                                }
                            </Stack>
                          )
                        : bodyFormatState === RequestBodyType.raw
                            ? <Field className="raw-textarea-field">
                                <Textarea
                                    aria-label="Request body"
                                    placeholder="Enter request body"
                                    className={"raw-textarea"}
                                    resize="vertical"
                                    value={body}
                                    onChange={(_, data) => {
                                        updateBody(data.value);
                                        updateBodyFormat(RequestBodyType.raw);
                                        setIsBodyEdited(true);
                                    }}
                                />
                            </Field>
                            : bodyFormatState === RequestBodyType.binary
                                && <BinaryField
                                    fileName={file?.name}
                                    updateBinary={(file) => uploadFile(file)}
                                />
                    }
                    {isBodyEdited &&
                        <Button
                            icon={<ArrowClockwiseRegular />}
                            className={"body-revert-button"}
                            onClick={() => {
                                updateBody(initialBody);
                                updateBodyBinary(null);
                                updateBodyFormat(RequestBodyType.raw);
                                setIsBodyEdited(false);
                            }}
                        >
                            Revert changes
                        </Button>
                    }
                </div>
            }
        </div>
    );
}