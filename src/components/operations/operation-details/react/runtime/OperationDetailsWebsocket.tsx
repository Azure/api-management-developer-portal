import * as React from "react";
import { useEffect, useState } from "react";
import { Body1, Button, Caption1Strong, Spinner, Subtitle1, Subtitle2, Tooltip } from "@fluentui/react-components";
import { Copy16Regular } from "@fluentui/react-icons";
import { ApiService } from "../../../../../services/apiService";
import { Operation } from "../../../../../models/operation";
import { Api } from "../../../../../models/api";
import { Utils } from "../../../../../utils";
import { OperationDetailsRuntimeProps } from "./OperationDetailsRuntime";

export const OperationDetailsWebsocket = ({
    apiName,
    apiService,
    enableConsole,
    includeAllHostnames
}: OperationDetailsRuntimeProps & { apiName: string, apiService: ApiService }) => {
    const [working, setWorking] = useState(false);
    const [api, setApi] = useState<Api>(null);
    const [operation, setOperation] = useState<Operation>(null);
    const [hostnames, setHostnames] = useState<string[]>([]);
    const [requestUrl, setRequestUrl] = useState<string>(null);
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        if (apiName) {
            setWorking(true);
            loadApi().then(loadedApi => setApi(loadedApi));
            loadOperation().then(loadedOperation => setOperation(loadedOperation));
            loadGatewayInfo().then(hostnames => {
                hostnames.length > 0 && setHostnames(hostnames);
            }).finally(() => setWorking(false));
        }
    }, [apiName]);

    useEffect(() => {
        setRequestUrl(getRequestUrl());
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

    const loadOperation = async (): Promise<Operation> => {
        let operation: Operation;

        try {
            // As WS APIs don't expose API operations, selecting the first operation if exists
            const operations = await apiService.getOperations(`apis/${apiName}`);
            operation = operations?.value[0];
        } catch (error) {
            throw new Error(`Unable to load the operation. Error: ${error.message}`);
        }

        return operation;
    }

    const loadGatewayInfo = async (): Promise<string[]> => {
        return await apiService.getApiHostnames(apiName, includeAllHostnames);
    }

    const getRequestUrl = (): string => {
        if (!api || !operation) return "";

        let operationPath = api.versionedPath;
        operationPath += operation.displayUrlTemplate;

        let requestUrl = "";
        const hostname = hostnames?.[0];

        if (hostname) requestUrl += hostname;

        requestUrl += Utils.ensureLeadingSlash(operationPath);

        if (api.apiVersion && api.apiVersionSet?.versioningScheme === "Query") {
            return Utils.addQueryParameter(requestUrl, api.apiVersionSet.versionQueryName, api.apiVersion);
        }

        return requestUrl;
    }

    return (
        <div className={"operation-details-container"}>
            <Subtitle1 block className={"operation-details-title"}>Operations</Subtitle1>
            {working 
                ? <Spinner label="Loading..." labelPosition="below" size="small" />
                : !operation
                    ? <Body1>No operation selected.</Body1> 
                    : <>
                        <div className={"operation-table"}>
                            <div className={"operation-table-header"}>
                                <Subtitle2>{operation.displayName}</Subtitle2>
                                {operation.description && <Body1 block className={"operation-description"}>{operation.description}</Body1>}
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
                      </>
            }
        </div>
    );
}