import * as React from "react";
import { useState } from "react";
import { Stack } from "@fluentui/react";
import { Body1, Body1Strong, Link, Subtitle1, Subtitle2Stronger, Tab, TabList, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from "@fluentui/react-components";
import { TypeDefinition, TypeDefinitionPropertyTypeCombination } from "../../../../../models/typeDefinition";
import { MarkdownProcessor } from "../../../../utils/react/MarkdownProcessor";
import { CodeSnippet } from "../../../../utils/react/CodeSnippet";
import { TSchemaView } from "./OperationRepresentation";

type TypeDefinitionProps = {
    definition: TypeDefinition;
    showExamples?: boolean;
    getReferenceUrl?: (reference: string) => string;
    getReferenceId?: (reference: string) => string;
    defaultSchemaView?: TSchemaView;
}

enum TDefinitionKind {
    indexed = "indexed",
    object = "object",
    array = "array",
    enum = "enum",
    combination = "combination"
}

enum TPropertyDisplayAs {
    primitive = "primitive",
    arrayOfPrimitive = "arrayOfPrimitive",
    reference = "reference",
    arrayOfReference = "arrayOfReference",
    combination = "combination"
}

export const TypeDefinitionInList = ({ definition, showExamples, getReferenceUrl, getReferenceId, defaultSchemaView }: TypeDefinitionProps) => {
    const [schemaView, setSchemaView] = useState<TSchemaView>(defaultSchemaView || TSchemaView.table);
    const anchorId = getReferenceId(definition.name);

    return (
        <>
            <Subtitle1 block className={"operation-subtitle2"} id={anchorId}>{definition.name}</Subtitle1>
            <Stack horizontal horizontalAlign="space-between" className={"operation-body"}>
                <TabList selectedValue={schemaView} onTabSelect={(e, data: { value: TSchemaView }) => setSchemaView(data.value)}>
                    <Tab value={TSchemaView.table}>Table</Tab>
                    <Tab value={TSchemaView.schema}>Schema</Tab>
                </TabList>
            </Stack>
            {schemaView === TSchemaView.schema
                ? <CodeSnippet
                    name={definition.name}
                    content={definition.rawSchema}
                    format={definition.rawSchemaFormat}
                  />
                : <TypeDefinitionForRepresentation
                    definition={definition}
                    showExamples={showExamples}
                    getReferenceUrl={getReferenceUrl}
                  />
            }
        </>
    );
}

export const TypeDefinitionForRepresentation = ({ definition, showExamples, getReferenceUrl }: TypeDefinitionProps) => {
    const kind = definition.kind;

    return (
        <>
            <Subtitle2Stronger block className={"operation-subtitle2"}>{definition.name}</Subtitle2Stronger>
            {definition.description && <MarkdownProcessor markdownToDisplay={definition.description} />}
            {kind === TDefinitionKind.combination &&
                <TypeDefinitionCombination definition={definition} showExamples={showExamples} getReferenceUrl={getReferenceUrl} />
            }
            {kind === TDefinitionKind.enum && <TypeDefinitionEnum definition={definition} />}
            {(kind === TDefinitionKind.object || kind === TDefinitionKind.array) && 
                <TypeDefinitionObject definition={definition} showExamples={showExamples} getReferenceUrl={getReferenceUrl} />
            }
            {/* TODO: indexer */}
        </>
    );
}

const TypeDefinitionCombination = ({ definition, showExamples, getReferenceUrl }: TypeDefinitionProps) => {
    const type = definition.type as TypeDefinitionPropertyTypeCombination;

    return (
        <>
            <div className={"td-combinations"}>
                <Body1>{type.combinationType}:</Body1>
                {type.combinationReferences.length > 0 && type.combinationReferences.map(ref => (
                    <Body1 block key={ref}><Link href={getReferenceUrl(ref)}>{ref}</Link></Body1>
                ))}
            </div>
            {definition.properties.map(property => (
                <React.Fragment key={property.name}>
                    <Body1Strong block className={"td-combination-name"}>{property.name}</Body1Strong>
                    {property.kind === TDefinitionKind.combination &&
                        <TypeDefinitionCombination definition={property as TypeDefinition} showExamples={showExamples} getReferenceUrl={getReferenceUrl} />
                    }
                    {property.kind === TDefinitionKind.enum && <TypeDefinitionEnum definition={property as TypeDefinition} />}
                    {(property.kind === TDefinitionKind.object || property.kind === TDefinitionKind.array) && 
                        <TypeDefinitionObject definition={property as TypeDefinition} showExamples={showExamples} getReferenceUrl={getReferenceUrl} />
                    }
                    {/* TODO: indexer */}
                </React.Fragment>
            ))}
        </>
    );
}

const TypeDefinitionEnum = ({ definition }: TypeDefinitionProps) => {
    const enumValues = definition.enum.join(", ");

    return (
        <Table aria-label={definition.name} className={"fui-table"}>
            <TableHeader>
                <TableRow className={"fui-table-headerRow"}>
                    <TableHeaderCell><Body1Strong>Type</Body1Strong></TableHeaderCell>
                    <TableHeaderCell><Body1Strong>Values</Body1Strong></TableHeaderCell>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow className={"fui-table-body-row"}>
                    <TableCell><Body1>{definition.type["name"]}</Body1></TableCell>
                    <TableCell><Body1>{enumValues}</Body1></TableCell>
                </TableRow>
            </TableBody>
        </Table>
    );

}

const TypeDefinitionObject = ({ definition, showExamples, getReferenceUrl }: TypeDefinitionProps) => {
    if (!definition.properties || definition.properties.length === 0) return;

    return (
        <Table aria-label={definition.name} className={"fui-table"}>
            <TableHeader>
                <TableRow className={"fui-table-headerRow"}>
                    <TableHeaderCell><Body1Strong>Name</Body1Strong></TableHeaderCell>
                    <TableHeaderCell><Body1Strong>Required</Body1Strong></TableHeaderCell>
                    {definition.readOnly && <TableHeaderCell><Body1Strong>Read-only</Body1Strong></TableHeaderCell>}
                    <TableHeaderCell><Body1Strong>Type</Body1Strong></TableHeaderCell>
                    <TableHeaderCell><Body1Strong>Description</Body1Strong></TableHeaderCell>
                    {showExamples && <TableHeaderCell><Body1Strong>Example</Body1Strong></TableHeaderCell>}
                </TableRow>
            </TableHeader>
            <TableBody>
                {definition.properties.map(property => {
                    let type: JSX.Element;
                    const typeName = property.type["name"];

                    if (property.type.displayAs === TPropertyDisplayAs.combination) {
                        let children = [<Body1 block>{property.type["combinationType"]}:</Body1>];

                        property.type["combination"].map(combinationProperty => {
                            const combinationName = combinationProperty["name"];

                            if (combinationProperty["displayAs"] === TPropertyDisplayAs.reference) {
                                children.push(
                                    <Body1 block className={"truncate-text"}>
                                        <Link href={getReferenceUrl(combinationName)} title={combinationName}>{combinationName}</Link>
                                    </Body1>
                                );
                            } else {
                                children.push(<Body1 block title={combinationName}>{combinationName}</Body1>);
                            }                                
                        });
                        
                        type = <>{children}</>;
                    } else if (property.type.displayAs === TPropertyDisplayAs.reference || property.type.displayAs === TPropertyDisplayAs.arrayOfReference) {
                        type = <Link href={getReferenceUrl(typeName)} title={typeName}>{typeName + (property.type.displayAs === TPropertyDisplayAs.arrayOfReference ? "[]" : "")}</Link>;
                    } else {
                        type = <Body1>{typeName + (property.type.displayAs === TPropertyDisplayAs.arrayOfPrimitive ? "[]" : "")}</Body1>;
                    }

                    return (
                        <TableRow key={property.name} className={"fui-table-body-row"}>
                            <TableCell><Body1 className={"truncate-text"} title={property.name}>{property.name}</Body1></TableCell>
                            <TableCell><Body1>{property.required ? "true" : "false"}</Body1></TableCell>
                            {definition.readOnly && <TableCell><Body1>{property.readOnly}</Body1></TableCell>}
                            <TableCell><Body1 className={"truncate-text"}>{type}</Body1></TableCell>
                            <TableCell><Body1 title={property.description}>
                                <MarkdownProcessor markdownToDisplay={property.description} maxChars={100} truncate={true} />
                            </Body1></TableCell>
                            {showExamples && 
                                <TableCell>
                                    {!!property.example && <Body1 className={"truncate-text td-example"} title={property.example}>{property.example}</Body1>}
                                </TableCell>
                            }
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}
