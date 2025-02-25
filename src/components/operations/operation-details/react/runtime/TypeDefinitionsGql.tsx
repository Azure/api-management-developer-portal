import * as React from "react";
import { useState } from "react";
import { GraphQLCompositeType, GraphQLEnumValue, GraphQLField, GraphQLInputType, GraphQLObjectType, GraphQLOutputType, isEnumType, isUnionType } from "graphql";
import { Stack } from "@fluentui/react";
import { Tab, TabList, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from "@fluentui/react-components";
import { MarkdownProcessor } from "../../../../utils/react/MarkdownProcessor";
import { ScrollableTableContainer } from "../../../../utils/react/ScrollableTableContainer";
import { CodeSnippet } from "../../../../utils/react/CodeSnippet";
import { GraphqlFieldTypes } from "../../../../../constants";
import { TSchemaView } from "./OperationRepresentation";

type GQLTypeDefinitionProps = {
    graph: GraphQLCompositeType;
    getGraphType?: (type: GraphQLOutputType | GraphQLInputType) => JSX.Element;
    getGraphSchemaForRepresentation?: (graph) => string;
    getGraphReferenceId?: (reference: string) => string;
    defaultSchemaView?: TSchemaView;
}

export const TypeDefinitionGql = ({
    graph,
    getGraphType,
    getGraphSchemaForRepresentation,
    getGraphReferenceId,
    defaultSchemaView
}: GQLTypeDefinitionProps) => {
    const [schemaView, setSchemaView] = useState<TSchemaView>(defaultSchemaView || TSchemaView.table);
    const anchorId = getGraphReferenceId(graph.name);

    return (
        <>
            <h4 className={"operation-subtitle2"} id={anchorId}>{graph.name}</h4>
            <Stack horizontal horizontalAlign="space-between" className={"operation-body"}>
                <TabList selectedValue={schemaView} onTabSelect={(_, data: { value: TSchemaView }) => setSchemaView(data.value)}>
                    <Tab value={TSchemaView.table}>Table</Tab>
                    <Tab value={TSchemaView.schema}>Schema</Tab>
                </TabList>
            </Stack>
            {schemaView === TSchemaView.schema
                ? <CodeSnippet
                    name={graph.name}
                    content={getGraphSchemaForRepresentation(graph)}
                    format={"graphql"}
                  />
                : <GQLTypeDefinitionForRepresentation
                    graph={graph}
                    getGraphType={getGraphType}
                  />
            }
        </>
    );
}

const renderDescription = (description: string) => (
    <TableCell><div title={description}>
        <MarkdownProcessor markdownToDisplay={description} maxChars={100} truncate={true} />
    </div></TableCell>
)

const GQLTypeDefinitionForRepresentation = ({ graph, getGraphType }: GQLTypeDefinitionProps) => (
    <>
        <h5 className={"operation-subtitle2"}>{graph.name}</h5>
        {graph.description && <MarkdownProcessor markdownToDisplay={graph.description} />}
        <ScrollableTableContainer>
            <Table aria-label={graph.name} className={"fui-table"}>
                <TableHeader>
                    <TableRow className={"fui-table-headerRow"}>
                        {isEnumType(graph)
                            ? <TableHeaderCell><span className="strong">Value</span></TableHeaderCell>
                            : isUnionType(graph)
                                ? <TableHeaderCell><span className="strong">Possible types</span></TableHeaderCell>
                                : <>
                                    <TableHeaderCell><span className="strong">Fields</span></TableHeaderCell>
                                    <TableHeaderCell><span className="strong">Type</span></TableHeaderCell>
                                </>
                        }
                        <TableHeaderCell><span className="strong">Description</span></TableHeaderCell>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isEnumType(graph)
                        ? graph[GraphqlFieldTypes.values].map((value: GraphQLEnumValue) => (
                            <TableRow key={value.name} className={"fui-table-body-row"}>
                                <TableCell><span>{value.name}</span></TableCell>
                                {renderDescription(value.description)}
                            </TableRow>
                            ))
                        : isUnionType(graph)
                            ? graph[GraphqlFieldTypes.types].map((type: GraphQLObjectType) => (
                                <TableRow key={type.name} className={"fui-table-body-row"}>
                                    <TableCell><span>{getGraphType(type)}</span></TableCell>
                                    {renderDescription(type.description)}
                                </TableRow>
                            ))
                            : Object.values(graph[GraphqlFieldTypes.fields]).map((field: GraphQLField<any, any>) => (
                                <TableRow key={field.name} className={"fui-table-body-row"}>
                                    <TableCell><span>{field.name}</span></TableCell>
                                    <TableCell><span>{getGraphType(field.type)}</span></TableCell>
                                    {renderDescription(field.description)}
                                </TableRow>
                            ))
                    }
                </TableBody>
            </Table>
        </ScrollableTableContainer>
    </>
);
