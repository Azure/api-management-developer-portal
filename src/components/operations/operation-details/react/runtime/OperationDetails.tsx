import * as React from "react";
import { useEffect, useState } from "react";
import { Badge, Body1, Body1Strong, Button, Caption1Strong, Dropdown, Option, Spinner, Subtitle1, Subtitle2, Tab, TabList, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow, Tooltip } from "@fluentui/react-components";
import { Copy16Regular } from "@fluentui/react-icons";
import { ApiService } from "../../../../../services/apiService";
import { Operation } from "../../../../../models/operation";
import { Api } from "../../../../../models/api";
import { Utils } from "../../../../../utils";
import { OperationDetailsRuntimeProps } from "./OperationDetailsRuntime";
import { getRequestUrl } from "./utils";
import { Stack } from "@fluentui/react";
import { Request } from "../../../../../models/request";
import { Response } from "../../../../../models/response";
import { Tag } from "../../../../../models/tag";
import { MarkdownProcessor } from "../../../../react-markdown/MarkdownProcessor";

export const OperationDetails = ({
    apiName,
    operationName,
    apiService,
    enableConsole,
    includeAllHostnames,
    showExamples
}: OperationDetailsRuntimeProps & { apiName: string, operationName: string, apiService: ApiService }) => {
    const [working, setWorking] = useState(false);
    const [api, setApi] = useState<Api>(null);
    const [operation, setOperation] = useState<Operation>(null);
    const [tags, setTags] = useState<Tag[]>([]);
    const [request, setRequest] = useState<Request>(null);
    const [responses, setResponses] = useState<Response[]>(null);
    const [hostnames, setHostnames] = useState<string[]>([]);
    const [requestUrl, setRequestUrl] = useState<string>(null);
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        if (apiName) {
            setWorking(true);
            loadApi().then(loadedApi => setApi(loadedApi));
            loadOperation().then(loadedValues => {
                setOperation(loadedValues.operation);
                setTags(loadedValues.tags);
                setRequest(loadedValues.operation?.request);
                setResponses(loadedValues.operation?.getMeaningfulResponses());
            });
            loadGatewayInfo().then(hostnames => {
                hostnames.length > 0 && setHostnames(hostnames);
            }).finally(() => setWorking(false));
        }
    }, [apiName, operationName]);

    useEffect(() => {
        setRequestUrl(getRequestUrl(api, operation, hostnames?.[0]));
    }, [api, operation, hostnames]);

    useEffect(() => {
        isCopied && setTimeout(() => setIsCopied(false), 5000);
    }, [isCopied]);

    const loadApi = async (): Promise<Api> => {
        let api: Api;

        try {
            api = await apiService.getApi(`apis/${apiName}`);
        } catch (error) {
            throw new Error(`Unable to load the API. Error: ${error.message}`);
        }

        return api;
    }

    const loadOperation = async (): Promise<{operation: Operation, tags: Tag[]}> => {
        let operation: Operation;
        let tags: Tag[];

        console.log(operationName);

        try {
            if (operationName) {
                operation = await apiService.getOperation(`apis/${apiName}/operations/${operationName}`);
                tags = await apiService.getOperationTags(`apis/${apiName}/operations/${operationName}`);
            } else {
                const operations = await apiService.getOperations(`apis/${apiName}`);
                operation = operations?.value[0];

                operation && (tags = await apiService.getOperationTags(`apis/${apiName}/operations/${operation.name}`));
            }
        } catch (error) {
            throw new Error(`Unable to load the operation. Error: ${error.message}`);
        }

        console.log(operation, tags);

        return {operation, tags};
    }

    const loadGatewayInfo = async (): Promise<string[]> => {
        return await apiService.getApiHostnames(apiName, includeAllHostnames);
    }

    return (
        <div className={"operation-details-container"}>
            <Subtitle1 block className={"operation-details-title"}>Operations</Subtitle1>
            {working 
                ? <Spinner label="Loading..." labelPosition="below" size="small" />
                : !operation
                    ? <Body1>No operation selected.</Body1> 
                    : <div className={"operation-details-content"}>
                        <div className={"operation-table"}>
                            <div className={"operation-table-header"}>
                                <Subtitle2>{operation.displayName}</Subtitle2>
                                {operation.description &&
                                    <Body1 block className={"operation-description"}>
                                        <MarkdownProcessor markdownToDisplay={operation.description} />
                                    </Body1>
                                }
                                {tags.length > 0 &&
                                    <Stack horizontal className={"operation-tags"}>
                                        <Body1Strong>Tags:</Body1Strong>
                                        {tags.map(tag => <Badge key={tag.id} color="important" appearance="outline">{tag.name}</Badge>)}
                                    </Stack>
                                }
                            </div>
                            <div className={"operation-table-body"}>
                                <div className={"operation-table-body-row"}>
                                    <Caption1Strong className={`operation-info-caption operation-method method-${operation.method}`}>{operation.method}</Caption1Strong>
                                    <Body1 className={"operation-text"}>{requestUrl}</Body1>
                                    <Tooltip
                                        content={isCopied ? "Copied to clipboard!" : "Copy to clipboard"}
                                        relationship={"description"}
                                        hideDelay={isCopied ? 3000 : 250}
                                    >
                                        <Button
                                            icon={<Copy16Regular />}
                                            appearance="transparent"
                                            onClick={() => {
                                                navigator.clipboard.writeText(requestUrl);
                                                setIsCopied(true);
                                            }}
                                        />
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                        {/* TODO: implement! */}
                        {enableConsole && <Button>Try this operation</Button>}
                        {request &&
                            <div className={"operation-request"}>
                                <Subtitle1 block className={"operation-subtitle1"}>Request</Subtitle1>
                                {request.description && <MarkdownProcessor markdownToDisplay={request.description} />}
                                {operation.parameters?.length > 0 &&
                                    <>
                                        <Subtitle2 block className={"operation-subtitle2"}>Request parameters</Subtitle2>
                                        <Table aria-label={"Request parameters table"} className={"fui-table"}>
                                            <TableHeader>
                                                <TableRow className={"fui-table-headerRow"}>
                                                    <TableHeaderCell><Body1Strong>Name</Body1Strong></TableHeaderCell>
                                                    <TableHeaderCell><Body1Strong>In</Body1Strong></TableHeaderCell>
                                                    <TableHeaderCell><Body1Strong>Required</Body1Strong></TableHeaderCell>
                                                    <TableHeaderCell><Body1Strong>Type</Body1Strong></TableHeaderCell>
                                                    <TableHeaderCell><Body1Strong>Description</Body1Strong></TableHeaderCell>
                                                    {showExamples && <TableHeaderCell><Body1Strong>Example</Body1Strong></TableHeaderCell>} {/** TODO */}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {operation.parameters.map(parameter => (
                                                    <TableRow key={parameter.name} className={"fui-table-body-row"}>
                                                        <TableCell><Body1>{parameter.name}</Body1></TableCell>
                                                        <TableCell><Body1>{parameter.in}</Body1></TableCell>
                                                        <TableCell><Body1>{parameter.required ? "true" : "false"}</Body1></TableCell>
                                                        <TableCell><Body1>{parameter.type}</Body1></TableCell>
                                                        <TableCell><Body1><MarkdownProcessor markdownToDisplay={parameter.description} /></Body1></TableCell>
                                                        {showExamples && <TableCell><Body1></Body1></TableCell>}
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </>
                                }
                                {request.headers?.length > 0 &&
                                    <>
                                        <Subtitle2 block className={"operation-subtitle2"}>Request headers</Subtitle2>
                                        <Table aria-label={"Request headers table"} className={"fui-table"}>
                                            <TableHeader>
                                                <TableRow className={"fui-table-headerRow"}>
                                                    <TableHeaderCell><Body1Strong>Name</Body1Strong></TableHeaderCell>
                                                    <TableHeaderCell><Body1Strong>Required</Body1Strong></TableHeaderCell>
                                                    <TableHeaderCell><Body1Strong>Type</Body1Strong></TableHeaderCell>
                                                    <TableHeaderCell><Body1Strong>Description</Body1Strong></TableHeaderCell>
                                                    {showExamples && <TableHeaderCell><Body1Strong>Example</Body1Strong></TableHeaderCell>} {/** TODO */}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {request.headers.map(header => (
                                                    <TableRow key={header.name} className={"fui-table-body-row"}>
                                                        <TableCell><Body1>{header.name}</Body1></TableCell>
                                                        <TableCell><Body1>{header.required ? "true" : "false"}</Body1></TableCell>
                                                        <TableCell><Body1>{header.type}</Body1></TableCell>
                                                        <TableCell><Body1><MarkdownProcessor markdownToDisplay={header.description} /></Body1></TableCell>
                                                        {showExamples && <TableCell><Body1></Body1></TableCell>}
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </>
                                }
                                {/* authorization servers! */}
                                {request.meaningfulRepresentations().length > 0 &&
                                    <Stack horizontal horizontalAlign="space-between" className={"operation-body"}>
                                        <TabList defaultSelectedValue="table">
                                            <Tab value="table">Table</Tab>
                                            <Tab value="schema">Schema</Tab>
                                        </TabList>
                                        <Stack horizontal verticalAlign="center">
                                            <Body1>Content type</Body1>
                                            <Dropdown
                                                value={request.meaningfulRepresentations()[0].contentType}
                                                selectedOptions={[request.meaningfulRepresentations()[0].contentType]}
                                                size="small"
                                                className={"operation-content-type-dropdown"}
                                            >
                                                {request.meaningfulRepresentations().map(representation => (
                                                    <Option key={representation.contentType} value={representation.contentType}>{representation.contentType}</Option>
                                                ))}
                                            </Dropdown>
                                            {/* <Dropdown
                                                options={request.contentTypes.map(contentType => ({key: contentType, text: contentType}))}
                                                defaultValue={request.contentTypes[0]}
                                            /> */}
                                        </Stack>
                                    </Stack>
                                }
                            </div>
                        }
                        {responses?.length > 0 &&
                            responses.map(response => (
                                <div className={"operation-response"}>
                                    <Subtitle1 block className={"operation-subtitle1"}>
                                        Response: {response.statusCode.code} {response.statusCode.description}
                                    </Subtitle1>
                                    {response.description && <MarkdownProcessor markdownToDisplay={response.description} />}
                                    {response.headers?.length > 0 &&
                                        <>
                                            <Subtitle2 block className={"operation-subtitle2"}>Response headers</Subtitle2>
                                            <Table aria-label={"Response headers table"} className={"fui-table"}>
                                                <TableHeader>
                                                    <TableRow className={"fui-table-headerRow"}>
                                                        <TableHeaderCell><Body1Strong>Name</Body1Strong></TableHeaderCell>
                                                        <TableHeaderCell><Body1Strong>Required</Body1Strong></TableHeaderCell>
                                                        <TableHeaderCell><Body1Strong>Type</Body1Strong></TableHeaderCell>
                                                        <TableHeaderCell><Body1Strong>Description</Body1Strong></TableHeaderCell>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {response.headers.map(header => (
                                                        <TableRow key={header.name} className={"fui-table-body-row"}>
                                                            <TableCell><Body1>{header.name}</Body1></TableCell>
                                                            <TableCell><Body1>{header.required ? "true" : "false"}</Body1></TableCell>
                                                            <TableCell><Body1>{header.type}</Body1></TableCell>
                                                            <TableCell><Body1><MarkdownProcessor markdownToDisplay={header.description} /></Body1></TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </>
                                    }
                                </div>
                        ))}
                      </div>
            }
        </div>
    );
}