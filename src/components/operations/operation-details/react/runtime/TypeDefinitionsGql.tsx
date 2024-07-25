import * as React from "react";
import { useState } from "react";
import { GraphQLCompositeType, GraphQLEnumValue, GraphQLField, GraphQLInputType, GraphQLObjectType, GraphQLOutputType, isEnumType, isUnionType } from "graphql";
import { Stack } from "@fluentui/react";
import { Body1, Body1Strong, Subtitle1, Subtitle2Stronger, Tab, TabList, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from "@fluentui/react-components";
import { MarkdownProcessor } from "../../../../utils/react/MarkdownProcessor";
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
            <Subtitle1 block className={"operation-subtitle2"} id={anchorId}>{graph.name}</Subtitle1>
            <Stack horizontal horizontalAlign="space-between" className={"operation-body"}>
                <TabList selectedValue={schemaView} onTabSelect={(e, data: { value: TSchemaView }) => setSchemaView(data.value)}>
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
    <TableCell><Body1 title={description}>
        <MarkdownProcessor markdownToDisplay={description} maxChars={100} truncate={true} />
    </Body1></TableCell>
)

const GQLTypeDefinitionForRepresentation = ({ graph, getGraphType }: GQLTypeDefinitionProps) => (
    <>
        <Subtitle2Stronger block className={"operation-subtitle2"}>{graph.name}</Subtitle2Stronger>
        {graph.description && <MarkdownProcessor markdownToDisplay={graph.description} />}
        <Table aria-label={graph.name} className={"fui-table"}>
            <TableHeader>
                <TableRow className={"fui-table-headerRow"}>
                    {isEnumType(graph)
                        ? <TableHeaderCell><Body1Strong>Value</Body1Strong></TableHeaderCell>
                        : isUnionType(graph)
                            ? <TableHeaderCell><Body1Strong>Possible types</Body1Strong></TableHeaderCell>
                            : <>
                                <TableHeaderCell><Body1Strong>Fields</Body1Strong></TableHeaderCell>
                                <TableHeaderCell><Body1Strong>Type</Body1Strong></TableHeaderCell>
                              </>
                    }
                    <TableHeaderCell><Body1Strong>Description</Body1Strong></TableHeaderCell>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isEnumType(graph)
                    ? graph[GraphqlFieldTypes.values].map((value: GraphQLEnumValue) => (
                        <TableRow key={value.name} className={"fui-table-body-row"}>
                            <TableCell><Body1>{value.name}</Body1></TableCell>
                            {renderDescription(value.description)}
                        </TableRow>
                        ))
                    : isUnionType(graph)
                        ? graph[GraphqlFieldTypes.types].map((type: GraphQLObjectType) => (
                            <TableRow key={type.name} className={"fui-table-body-row"}>
                                <TableCell><Body1>{getGraphType(type)}</Body1></TableCell>
                                {renderDescription(type.description)}
                            </TableRow>
                        ))
                        : Object.values(graph[GraphqlFieldTypes.fields]).map((field: GraphQLField<any, any>) => (
                            <TableRow key={field.name} className={"fui-table-body-row"}>
                                <TableCell><Body1>{field.name}</Body1></TableCell>
                                <TableCell><Body1>{getGraphType(field.type)}</Body1></TableCell>
                                {renderDescription(field.description)}
                            </TableRow>
                          ))
                }
            </TableBody>
        </Table>
    </>
);
