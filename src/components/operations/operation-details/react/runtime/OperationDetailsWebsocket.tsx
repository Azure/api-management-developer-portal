import * as React from "react";
import { useEffect, useState } from "react";
import { Stack } from "@fluentui/react";
import { Badge, Body1, Body1Strong, Button, Caption1Strong, Spinner, Subtitle1, Subtitle2, Tooltip } from "@fluentui/react-components";
import { Copy16Regular } from "@fluentui/react-icons";
import { ApiService } from "../../../../../services/apiService";
import { Operation } from "../../../../../models/operation";
import { Api } from "../../../../../models/api";
import { Tag } from "../../../../../models/tag";
import { MarkdownProcessor } from "../../../../utils/react/MarkdownProcessor";
import { getRequestUrl, scrollToOperation } from "./utils";
import { OperationDetailsRuntimeProps } from "./OperationDetailsRuntime";

export const OperationDetailsWebsocket = ({
    apiName,
    apiService,
    enableConsole,
    includeAllHostnames,
    enableScrollTo
}: OperationDetailsRuntimeProps & { apiName: string, apiService: ApiService }) => {
    const [working, setWorking] = useState(false);
    const [api, setApi] = useState<Api>(null);
    const [operation, setOperation] = useState<Operation>(null);
    const [tags, setTags] = useState<Tag[]>([]);
    const [hostnames, setHostnames] = useState<string[]>([]);
    const [requestUrl, setRequestUrl] = useState<string>(null);
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        if (!apiName) return;

        setWorking(true);
        loadApi().then(loadedApi => setApi(loadedApi));
        loadGatewayInfo().then(hostnames => {
            hostnames.length > 0 && setHostnames(hostnames);
        });
        loadOperation().then(loadedValues => {
            setOperation(loadedValues.operation);
            setTags(loadedValues.tags);
        }).finally(() => {
            setWorking(false);
            enableScrollTo && scrollToOperation();
        });
    }, [apiName]);

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

        try {
            // As WS APIs don't expose API operations, selecting the first operation if exists
            const operations = await apiService.getOperations(`apis/${apiName}`);
            operation = operations?.value[0];

            operation && (tags = await apiService.getOperationTags(`apis/${apiName}/operations/${operation.name}`));
        } catch (error) {
            throw new Error(`Unable to load the operation. Error: ${error.message}`);
        }

        return {operation, tags};
    }

    const loadGatewayInfo = async (): Promise<string[]> => {
        return await apiService.getApiHostnames(apiName, includeAllHostnames);
    }

    return (
        <div className={"operation-details-container"}>
            <Subtitle1 block className={"operation-details-title"} id={"operation"}>Operation</Subtitle1>
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
                                    <Caption1Strong className={"operation-info-caption ws-caption"}>Socket URL</Caption1Strong>
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
                                {api.protocols &&
                                    <div className={"operation-table-body-row"}>
                                        <Caption1Strong className={"operation-info-caption ws-caption"}>Protocol</Caption1Strong>
                                        <Body1 className={"operation-text"}>{api.protocols.join(", ")}</Body1>
                                    </div>
                                }
                            </div>
                        </div>
                        {/* TODO: implement! */}
                        {enableConsole && <Button>Try this operation</Button>}
                      </div>
            }
        </div>
    );
}