import * as React from "react";
import { useEffect, useState } from "react";
import { Stack } from "@fluentui/react";
import { Badge, Body1, Body1Strong, Button, Caption1Strong, Link, Spinner, Subtitle1, Subtitle2, Tooltip } from "@fluentui/react-components";
import { Copy16Regular } from "@fluentui/react-icons";
import { ApiService } from "../../../../../services/apiService";
import { Operation } from "../../../../../models/operation";
import { Api } from "../../../../../models/api";
import { getRequestUrl, scrollToOperation } from "./utils";
import { OperationDetailsRuntimeProps } from "./OperationDetailsRuntime";
import { GraphqlService } from "../../../../../services/graphqlService";
import { GraphQLField, GraphQLInputType, GraphQLList, GraphQLNonNull, GraphQLOutputType, GraphQLScalarType, GraphQLType, graphql } from "graphql";
import { MarkdownProcessor } from "../../../../utils/react/MarkdownProcessor";
import { GraphqlDefaultScalarTypes } from "../../../../../constants";
import { RouteHelper } from "../../../../../routing/routeHelper";

export const OperationDetailsGql = ({
    apiName,
    apiService,
    graphName,
    graphType,
    graphqlService,
    routeHelper,
    enableConsole,
    includeAllHostnames,
    enableScrollTo
}: OperationDetailsRuntimeProps & { apiName: string, graphName: string, graphType: string, apiService: ApiService, graphqlService: GraphqlService, routeHelper: RouteHelper }) => {
    const [working, setWorking] = useState(false);
    const [api, setApi] = useState<Api>(null);
    const [graph, setGraph] = useState<GraphQLField<any, any>>(null);
    const [operation, setOperation] = useState<Operation>(null);
    const [hostnames, setHostnames] = useState<string[]>([]);
    const [requestUrl, setRequestUrl] = useState<string>(null);
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        if (!apiName || !graphName || !graphType) {
            setGraph(null);
            return;
        }
        
        setWorking(true);
        loadApi().then(loadedApi => setApi(loadedApi));
        loadGatewayInfo().then(hostnames => {
            hostnames.length > 0 && setHostnames(hostnames);
        });
        loadGraph()
            .then(graph => setGraph(graph))
            .finally(() => setWorking(false));
    }, [apiName, graphName, graphType]);

    useEffect(() => {
        setRequestUrl(getRequestUrl(api, null, hostnames?.[0]));
    }, [api, hostnames]);

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

    const loadGraph = async () => {
        let graph: GraphQLField<any, any>;

        try {
            const graphqlTypes = await graphqlService.getGraphqlTypes(apiName);
            const availableGraphqlTypes = await graphqlService.getAvailableGraphqlTypes(graphqlTypes);
            graph = graphqlTypes[graphType.toLowerCase()][graphName];
        } catch (error) {
            throw new Error(`Unable to load the API. Error: ${error.message}`);
        }

        return graph;
    }

    const loadGatewayInfo = async (): Promise<string[]> => {
        return await apiService.getApiHostnames(apiName, includeAllHostnames);
    }

    const getType = (type: GraphQLOutputType | GraphQLInputType): JSX.Element => {
        let typeJsx = null;
        const typeIndicators = [];

        while ((type instanceof GraphQLList) || (type instanceof GraphQLNonNull)) {
            if (type instanceof GraphQLList) {
                typeIndicators.unshift("[");
                typeIndicators.push("]");
            } else {
                typeIndicators.push("!");
            }
            type = type.ofType;
        }

        const typeName = type.name;

        if (type instanceof GraphQLScalarType || GraphqlDefaultScalarTypes.includes(typeName)) {
            typeJsx = <Body1>{typeName}</Body1>;
        } else if (graphType && graphName) {
            const typeRef = "#" + routeHelper.getGraphDefinitionReferenceId(apiName, graphType, graphName, typeName);
            typeJsx = <Link href={typeRef}>{typeName}</Link>;
        }

        if (typeIndicators.length === 0) {
            return typeJsx;
        } else if (!typeIndicators.includes("[")) {
            return <Body1 block>{typeJsx}{typeIndicators.join("")}</Body1>;
        } else {
            return <Body1 block>{typeIndicators.map(indicator => indicator === "[" ? <>{indicator}{typeJsx}</> : indicator)}</Body1>;
        }
    }

    return (
        <div className={"operation-details-container"}>
            <Subtitle1 block className={"operation-details-title"} id={"operation"}>Operation</Subtitle1>
            {working 
                ? <Spinner label="Loading..." labelPosition="below" size="small" />
                : !graph
                    ? <Body1>No graph selected.</Body1> 
                    : <div className={"operation-details-content"}>
                        <div className={"operation-table"}>
                            <div className={"operation-table-header"}>
                                <Subtitle2>{graph.name}</Subtitle2>
                                {graph.description &&
                                    <Body1 block className={"operation-description"}>
                                        <MarkdownProcessor markdownToDisplay={graph.description} />
                                    </Body1>
                                }
                            </div>
                            <div className={"operation-table-body"}>
                                <div className={"operation-table-body-row"}>
                                    <Caption1Strong className={"operation-info-caption"}>GraphQL endpoint</Caption1Strong>
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
                        {graph.type &&
                            <div className={"operation-response"}>
                                <Subtitle1 block className={"operation-subtitle1"}>Response type</Subtitle1>
                                {getType(graph.type)}
                            </div>
                        }
                      </div>
            }
        </div>
    );
}