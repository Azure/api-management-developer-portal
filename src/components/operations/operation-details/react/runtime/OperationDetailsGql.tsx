import * as React from "react";
import { useEffect, useState } from "react";
import {
    GraphQLField,
    GraphQLInputType,
    GraphQLObjectType,
    GraphQLOutputType,
    isInputObjectType,
    isInterfaceType,
    isListType,
    isObjectType,
    isScalarType,
    isUnionType,
    isWrappingType
} from "graphql";
import { Stack } from "@fluentui/react";
import {
    Body1,
    Body1Strong,
    Button,
    Caption1Strong,
    Link,
    Spinner,
    Subtitle1,
    Subtitle2,
    Tab,
    TabList,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
    Tooltip
} from "@fluentui/react-components";
import { Copy16Regular } from "@fluentui/react-icons";
import { Api } from "../../../../../models/api";
import { ApiService } from "../../../../../services/apiService";
import { GraphqlService, TGraphqlTypes } from "../../../../../services/graphqlService";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { MarkdownProcessor } from "../../../../utils/react/MarkdownProcessor";
import { CodeSnippet } from "../../../../utils/react/CodeSnippet";
import { GraphqlDefaultScalarTypes, GraphqlFieldTypes } from "../../../../../constants";
import { TSchemaView } from "./OperationRepresentation";
import { OperationDetailsRuntimeProps } from "./OperationDetailsRuntime";
import { getRequestUrl, scrollToOperation } from "./utils";
import { TypeDefinitionGql } from "./TypeDefinitionsGql";

export const OperationDetailsGql = ({
    apiName,
    apiService,
    graphName,
    graphType,
    graphqlService,
    routeHelper,
    enableConsole,
    includeAllHostnames,
    enableScrollTo,
    defaultSchemaView
}: OperationDetailsRuntimeProps & { apiName: string, graphName: string, graphType: string, apiService: ApiService, graphqlService: GraphqlService, routeHelper: RouteHelper }) => {
    const [working, setWorking] = useState(false);
    const [api, setApi] = useState<Api>(null);
    const [graph, setGraph] = useState<GraphQLField<any, any>>(null);
    const [graphSchema, setGraphSchema] = useState(null);
    const [references, setReferences] = useState([]);
    const [hostnames, setHostnames] = useState<string[]>([]);
    const [requestUrl, setRequestUrl] = useState<string>(null);
    const [schemaView, setSchemaView] = useState<TSchemaView>(defaultSchemaView as TSchemaView || TSchemaView.table);
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        if (!apiName || !graphName || !graphType) {
            setGraph(null);
            return;
        }
        
        setWorking(true);
        Promise.all([
            loadApi().then(loadedApi => setApi(loadedApi)),
            loadGatewayInfo().then(hostnames => {
                hostnames?.length > 0 && setHostnames(hostnames);
            }),
            loadGraph().then(graphValues => {
                setGraph(graphValues.graph);
                setGraphSchema(graphValues.graphSchema);
                setReferences(graphValues.references);
            })
        ])
        .catch(error => new Error(`Unable to load the graph details. Error: ${error.message}`))
        .finally(() => {
            setWorking(false);
            enableScrollTo && scrollToOperation();
        });
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
        let graphSchema: string;
        let references = [];

        try {
            const { graphqlTypes, schema } = await graphqlService.getGraphqlTypesAndSchema(apiName);
            graph = graphqlTypes[graphType.toLowerCase()][graphName];
            graphSchema = schema;
            references = getGraphReferences(graph, graphqlTypes);
        } catch (error) {
            throw new Error(`Unable to load the API. Error: ${error.message}`);
        }

        return {graph, graphSchema, references};
    }

    const loadGatewayInfo = async (): Promise<string[]> => {
        return await apiService.getApiHostnames(apiName, includeAllHostnames);
    }

    const getGraphType = (type: GraphQLOutputType | GraphQLInputType): JSX.Element => {
        let typeJsx = null;
        const typeIndicators = [];

        while (isWrappingType(type)) {
            if (isListType(type)) {
                typeIndicators.unshift("[");
                typeIndicators.push("]");
            } else {
                typeIndicators.push("!");
            }
            type = type.ofType;
        }

        const typeName = type.name;

        if (isScalarType(type) || GraphqlDefaultScalarTypes.includes(typeName)) {
            typeJsx = <Body1>{typeName}</Body1>;
        } else if (graphType && graphName) {
            typeJsx = <Link href={getGraphReferenceUrl(typeName)}>{typeName}</Link>;
        }

        if (typeIndicators.length === 0) {
            return typeJsx;
        } else if (!typeIndicators.includes("[")) {
            return <Body1 block>{typeJsx}{typeIndicators.join("")}</Body1>;
        } else {
            return <Body1 block>{typeIndicators.map((indicator, index) => 
                indicator === "["
                    ? <React.Fragment key={indicator + index}>{indicator}{typeJsx}</React.Fragment>
                    : indicator
                )}</Body1>;
        }
    }
    
    const getGraphReferences = (graph, graphqlTypes: TGraphqlTypes, references = []) => {
        let type = graph.type;

        while (isWrappingType(type)) {
            type = type.ofType;
        }

        if (isScalarType(type) || GraphqlDefaultScalarTypes.includes(type.name)) return references;

        if (!references.some(reference => reference.name === type.name)) {
            references.push(type);

            if (isObjectType(type) || isInputObjectType(type) || isInterfaceType(type)) {
                Object.values(type[GraphqlFieldTypes.fields]).forEach(field => getGraphReferences(field, graphqlTypes, references));
            } else if (isUnionType(type)) {
                type[GraphqlFieldTypes.types].forEach((type: GraphQLObjectType) => {
                    !references.some(reference => reference.name === type.name) && references.push(type);
                    Object.values(type[GraphqlFieldTypes.fields]).forEach(field => getGraphReferences(field, graphqlTypes, references));
                });
            }
        }

        graph.args?.length > 0 && graph.args.forEach(arg => getGraphReferences(arg, graphqlTypes, references));

        references.sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically
        return references;
    }

    const getGraphReferenceUrl = (typeName: string): string => {
        if (!graphType || !graphName) return;

        return routeHelper.getGraphDefinitionAnchor(apiName, graphType, graphName, typeName);
    }

    const getGraphReferenceId = (typeName: string): string => {
        if (!graphType || !graphName) return;

        return routeHelper.getGraphDefinitionReferenceId(apiName, graphType, graphName, typeName);
    }

    const getGraphSchemaForRepresentation = (schemaGraph): string => {
        const location = schemaGraph?.astNode?.loc;
        return location && graphSchema.substring(location.start, location.end);
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
                                {getGraphType(graph.type)}
                            </div>
                        }
                        {graph.args?.length > 0 &&
                            <div className={"operation-response"}>
                                <Subtitle1 block className={"operation-subtitle1"}>Arguments</Subtitle1>
                                <Stack horizontal horizontalAlign="space-between" className={"operation-body"}>
                                    <TabList selectedValue={schemaView} onTabSelect={(e, data: { value: TSchemaView }) => setSchemaView(data.value)}>
                                        <Tab value={TSchemaView.table}>Table</Tab>
                                        <Tab value={TSchemaView.schema}>Schema</Tab>
                                    </TabList>
                                </Stack>
                                {schemaView === TSchemaView.table
                                    ? <Table aria-label={"Definitions list"} className={"fui-table"}>
                                        <TableHeader>
                                            <TableRow className={"fui-table-headerRow"}>
                                                <TableHeaderCell><Body1Strong>Name</Body1Strong></TableHeaderCell>
                                                <TableHeaderCell><Body1Strong>Type</Body1Strong></TableHeaderCell>
                                                <TableHeaderCell><Body1Strong>Description</Body1Strong></TableHeaderCell>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {graph.args.map(arg => (
                                                <TableRow key={arg.name} className={"fui-table-body-row"}>
                                                    <TableCell>{arg.name}</TableCell>
                                                    <TableCell>{getGraphType(arg.type)}</TableCell>
                                                    <TableCell><Body1 title={arg.description}>
                                                        <MarkdownProcessor markdownToDisplay={arg.description} maxChars={250} truncate={true} />
                                                    </Body1></TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                      </Table>
                                    : <CodeSnippet name={graph.name} content={getGraphSchemaForRepresentation(graph)} format={"graphql"} />
                                }
                            </div>
                        }
                        {references?.length > 0 &&
                            <div className={"operation-definitions"}>
                                <Subtitle1 block className={"operation-details-title"}>Types</Subtitle1>
                                <Table aria-label={"Types list"} className={"fui-table"}>
                                    <TableHeader>
                                        <TableRow className={"fui-table-headerRow"}>
                                            <TableHeaderCell><Body1Strong>Name</Body1Strong></TableHeaderCell>
                                            <TableHeaderCell><Body1Strong>Description</Body1Strong></TableHeaderCell>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {references.map(reference => (
                                            <TableRow key={reference.name} className={"fui-table-body-row"}>
                                                <TableCell>{getGraphType(reference)}</TableCell>
                                                <TableCell><Body1 title={reference.description}>
                                                    <MarkdownProcessor markdownToDisplay={reference.description} maxChars={250} truncate={true} />
                                                </Body1></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {references.map(reference => (
                                    <div key={reference.name} className={"operation-definition"}>
                                        <TypeDefinitionGql
                                            graph={reference}                                            
                                            getGraphType={getGraphType}
                                            getGraphSchemaForRepresentation={getGraphSchemaForRepresentation}
                                            getGraphReferenceId={getGraphReferenceId}
                                            defaultSchemaView={defaultSchemaView as TSchemaView}
                                        />
                                    </div>
                                ))}
                            </div>
                        }
                      </div>
            }
        </div>
    );
}