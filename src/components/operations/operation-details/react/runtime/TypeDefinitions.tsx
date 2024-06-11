import * as React from "react";
import { Body1, Body1Strong, Link, Subtitle2Stronger, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from "@fluentui/react-components";
import { TypeDefinition, TypeDefinitionPropertyTypeCombination } from "../../../../../models/typeDefinition";
import { MarkdownProcessor } from "../../../../react-markdown/MarkdownProcessor";

type TypeDefinitionProps = {
    definition: TypeDefinition;
    showExamples: boolean;
    getReferenceUrl: (reference: string) => string;
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


export const TypeDefinitionForRepresentation = ({ definition, showExamples, getReferenceUrl }: TypeDefinitionProps) => {
    const kind = definition.kind;

    return (
        <>
            <Subtitle2Stronger block className={"operation-subtitle2"}>{definition.name}</Subtitle2Stronger>
            {definition.description && <MarkdownProcessor markdownToDisplay={definition.description} />}
            {kind === TDefinitionKind.combination &&
                <TypeDefinitionCombination definition={definition} showExamples={showExamples} getReferenceUrl={getReferenceUrl} />
            }
            {(kind === TDefinitionKind.object || kind === TDefinitionKind.array) && 
                <TypeDefinitionObject definition={definition} showExamples={showExamples} getReferenceUrl={getReferenceUrl} />
            }
            {/* TODO: enum && indexer */}
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
                    {(property.kind === TDefinitionKind.object || property.kind === TDefinitionKind.array) && 
                        <TypeDefinitionObject definition={property as TypeDefinition} showExamples={showExamples} getReferenceUrl={getReferenceUrl} />
                    }
                    {/* TODO: enum && indexer */}
                </React.Fragment>
            ))}
        </>
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
