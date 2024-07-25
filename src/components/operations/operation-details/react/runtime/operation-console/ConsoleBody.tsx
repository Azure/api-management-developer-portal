import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Stack } from "@fluentui/react";
import { Body1, Body1Strong, Button, Dropdown, Field, Input, Label, Option, Radio, RadioGroup, Textarea, Tooltip } from "@fluentui/react-components";
import { AddCircleRegular, ArrowClockwiseRegular, ArrowUploadRegular, ChevronUp20Regular, DeleteRegular } from "@fluentui/react-icons";
import { ConsoleRepresentation } from "../../../../../../models/console/consoleRepresentation";
import { ConsoleRequest } from "../../../../../../models/console/consoleRequest";

type ConsoleBodyProps = {
    hasBody: boolean;
    request: ConsoleRequest;
    updateBody: (body: string) => void;
    updateBodyBinary: (file: File) => void;
}

export const ConsoleBody = ({ hasBody, request, updateBody, updateBodyBinary }: ConsoleBodyProps) => {
    const [isBodyCollapsed, setIsBodyCollapsed] = useState<boolean>(!hasBody);
    const [hasBodyState, setHasBodyState] = useState<boolean>(hasBody);
    const [bodyStash, setBodyStash] = useState<string>(request.body());
    const [bodyFormat, setBodyFormat] = useState<string>(request.bodyFormat());
    const [isBodyEdited, setIsBodyEdited] = useState<boolean>(false);
    const [selectedRepresentation, setSelectedRepresentation] = useState<ConsoleRepresentation>(request.representations[0] ?? null);
    const [selectedRepresentationId, setSelectedRepresentationId] = useState<string>(selectedRepresentation?.typeName + "+" + selectedRepresentation?.contentType ?? "");
    const [initialBody, setInitialBody] = useState<string>(selectedRepresentation?.sample ?? "");
    const [uploadedFileName, setUploadedFileName] = useState<string>("");

    const hiddenFileInput = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setBodyStash(request.body());
        setBodyFormat(request.bodyFormat());
        setSelectedRepresentation(request.representations[0] ?? null);
        setSelectedRepresentationId(request.representations[0]?.typeName + "+" + request.representations[0]?.contentType ?? "");
        setInitialBody(request.representations[0]?.sample ?? "");
    }, [request]);

    useEffect(() => {
        updateBody(bodyStash);
    }, [updateBody, bodyStash]);

    const addBody = () => {
        setIsBodyCollapsed(false);
        setHasBodyState(true);
        setBodyStash(initialBody);
    }

    const removeBody = () => {
        setIsBodyCollapsed(true);
        setHasBodyState(false);
        setBodyStash("");
        setIsBodyEdited(false);
        setUploadedFileName("");
        setBodyFormat("raw");
    }

    const selectRepresentation = (representationId: string) => {
        const representationNameAndType = representationId.split("+");
        const selectedRep = request.representations.find(representation =>
            representation.typeName === representationNameAndType[0] && representation.contentType === representationNameAndType[1]
        );
        setSelectedRepresentationId(representationId);
        setSelectedRepresentation(selectedRep);
        setInitialBody(selectedRep.sample ?? "");
    }

    const selectFile = () => {
        hiddenFileInput.current.click();
    };

    const uploadFile = (event) => {
        const fileUploaded = event.target.files[0];
        setUploadedFileName(fileUploaded.name);
        setBodyStash("");
        updateBodyBinary(fileUploaded);
    };

    const binaryField = (): JSX.Element => {
        return (
            <>
                <Button
                    icon={<ArrowUploadRegular />}
                    onClick={selectFile}
                    className="request-body-upload-button"
                >
                    Upload file
                </Button>
                <Body1 block>{uploadedFileName}</Body1>
                <input
                    type="file"
                    onChange={uploadFile}
                    ref={hiddenFileInput}
                    style={{ display: "none" }} // FluentUI doesn't have a file uploader, so using a hidden file input instead
                />
            </>
        );
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
                    {hasBodyState
                        ? <Tooltip content="Remove body" relationship="label">
                            <Button icon={<DeleteRegular />} appearance="subtle" onClick={() => removeBody()} />
                        </Tooltip>
                        : <Button icon={<AddCircleRegular />} onClick={() => addBody()}>Add body</Button>
                    }
                </Stack>
            </div>
            {(!isBodyCollapsed && hasBodyState) &&
                <div className={"operation-table-body-console"}>
                    <Stack horizontal verticalAlign="center">
                        <Stack.Item className="format-selection">
                            <RadioGroup
                                name={"Request body format"}
                                value={bodyFormat}
                                layout="horizontal"
                                onChange={(e, data) => setBodyFormat(data.value)}
                            >
                                {request.readonlyBodyFormat && <Radio value={"form"} label={"Form-data"} disabled />}
                                <Radio value={"raw"} label={"Raw"} disabled={request.readonlyBodyFormat} />
                                <Radio value={"binary"} label={"Binary"} disabled={request.readonlyBodyFormat} />
                            </RadioGroup>
                        </Stack.Item>
                        {bodyFormat === "raw" && request.representations.length > 0 &&
                            <Stack.Item grow>
                                <Dropdown
                                    aria-label="Sample request body"
                                    placeholder="Select sample request body"
                                    className="request-body-dropdown"
                                    value={selectedRepresentation.typeName}
                                    selectedOptions={[selectedRepresentationId]}
                                    onOptionSelect={(e, data) => selectRepresentation(data.optionValue)}
                                >
                                    {request.representations.map(representation => {
                                        const repId = representation.typeName + "+" + representation.contentType;
                                        return <Option key={repId} value={repId}>{representation.typeName}</Option>;
                                    })}
                                </Dropdown>
                            </Stack.Item>
                        }
                    </Stack>
                    {request.readonlyBodyFormat
                        ? request.bodyDataItems()?.map(dataItem =>
                            <Stack key={dataItem.name()}>
                                <Label htmlFor={dataItem.name()}>{dataItem.name()} (type: {dataItem.type()})</Label>
                                {dataItem.bodyFormat() === "string"
                                    ? <Input id={dataItem.name()} type="text" value={dataItem.body()} />
                                    : dataItem.bodyFormat() === "raw"
                                        ? <Textarea
                                            id={dataItem.name()}
                                            resize="vertical"
                                            value={dataItem.body()}
                                          />
                                        : dataItem.bodyFormat() === "binary" && binaryField()
                                }
                            </Stack>
                          )
                        : bodyFormat === "raw"
                            ? <Field className="request-body-raw">
                                <Textarea
                                    aria-label="Request body"
                                    placeholder="Enter request body"
                                    className={"request-body-textarea"}
                                    resize="vertical"
                                    value={bodyStash}
                                    onChange={(e, data) => {
                                        setBodyStash(data.value);
                                        setIsBodyEdited(true);
                                    }}
                                />
                            </Field>
                            : bodyFormat === "binary" && binaryField()
                    }
                    {isBodyEdited &&
                        <Button
                            icon={<ArrowClockwiseRegular />}
                            onClick={() => {
                                setBodyStash(initialBody);
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