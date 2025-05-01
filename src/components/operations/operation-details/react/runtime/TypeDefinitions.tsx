import * as React from "react";
import { useState } from "react";
import { Stack } from "@fluentui/react";
import { Tab, TabList, TableCell, TableRow } from "@fluentui/react-components";
import { InfoTable, MarkdownRenderer, RawSchema, TypeBadge } from "@microsoft/api-docs-ui";
import { TypeDefinition, TypeDefinitionPropertyTypeCombination } from "../../../../../models/typeDefinition";
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
            <h4 className={"operation-subtitle2"} id={anchorId}>{definition.name}</h4>
            <Stack horizontal horizontalAlign="space-between" className={"operation-body"}>
                <TabList selectedValue={schemaView} onTabSelect={(_, data: { value: TSchemaView }) => setSchemaView(data.value)}>
                    <Tab value={TSchemaView.table}>Table</Tab>
                    <Tab value={TSchemaView.schema}>Schema</Tab>
                </TabList>
            </Stack>
            {schemaView === TSchemaView.schema
                ? <RawSchema
                    schema={definition.rawSchema}
                    language={definition.rawSchemaFormat}
                    title={definition.name}
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
            <h5 className={"operation-subtitle2"}>{definition.name}</h5>
            {definition.description && <MarkdownRenderer markdown={definition.description} />}
            {kind === TDefinitionKind.combination
                ? <TypeDefinitionCombination definition={definition} showExamples={showExamples} getReferenceUrl={getReferenceUrl} />
                : kind === TDefinitionKind.enum 
                    ? <TypeDefinitionEnum definition={definition} />
                    : <TypeDefinitionObject definition={definition} showExamples={showExamples} getReferenceUrl={getReferenceUrl} />
            }
        </>
    );
}

const TypeDefinitionCombination = ({ definition, showExamples, getReferenceUrl }: TypeDefinitionProps) => {
    const type = definition.type as TypeDefinitionPropertyTypeCombination;

    return (
        <>
            <div className={"td-combinations"}>
                <span>{type.combinationType}:</span>
                {type.combinationReferences.length > 0 && type.combinationReferences.map(ref => (
                    <div key={ref}><a href={getReferenceUrl(ref)}>{ref}</a></div>
                ))}
            </div>
            {definition.properties.map(property => (
                <React.Fragment key={property.name}>
                    <div className={"td-combination-name"}>{property.name}</div>
                    {property.kind === TDefinitionKind.combination
                        ? <TypeDefinitionCombination definition={property as TypeDefinition} showExamples={showExamples} getReferenceUrl={getReferenceUrl} />
                        : property.kind === TDefinitionKind.enum
                            ? <TypeDefinitionEnum definition={property as TypeDefinition} />
                            : <TypeDefinitionObject definition={property as TypeDefinition} showExamples={showExamples} getReferenceUrl={getReferenceUrl} />
                    }
                </React.Fragment>
            ))}
        </>
    );
}

const TypeDefinitionEnum = ({ definition }: TypeDefinitionProps) => {
    const enumValues = definition.enum.join(", ");

    return (
        <InfoTable
            title={definition.name}
            columnLabels={["Type", "Values"]}
            children={
                <TableRow className={"fui-table-body-row"}>
                    <TableCell><TypeBadge value={definition.type["name"]} /></TableCell>
                    <TableCell><span>{enumValues}</span></TableCell>
                </TableRow>
            }
        />
    );

}

const TypeDefinitionObject = ({ definition, showExamples, getReferenceUrl }: TypeDefinitionProps) => {
    if (!definition.properties || definition.properties.length === 0) return;

    /** This is needed to ensure the right order of columns */
    const columnLabels = ["Name", "Required", "Type", "Description"];
    if (definition.readOnly) columnLabels.splice(2, 0, "Read-only");
    if (showExamples) columnLabels.push("Example");

    return (
        <InfoTable
            title={definition.name}
            columnLabels={columnLabels}
            children={definition.properties.map(property => {
                let type: JSX.Element;
                const typeName = property.type["name"];

                if (property.type.displayAs === TPropertyDisplayAs.combination) {
                    let children = [<div>{property.type["combinationType"]}:</div>];

                    property.type["combination"].map(combinationProperty => {
                        const combinationName = combinationProperty["name"];

                        if (combinationProperty["displayAs"] === TPropertyDisplayAs.reference) {
                            children.push(
                                <div className={"truncate-text"}>
                                    <a href={getReferenceUrl(combinationName)} title={combinationName}>{combinationName}</a>
                                </div>
                            );
                        } else {
                            children.push(<div title={combinationName}>{combinationName}</div>);
                        }                                
                    });
                    
                    type = <>{children}</>;
                } else if (property.type.displayAs === TPropertyDisplayAs.reference || property.type.displayAs === TPropertyDisplayAs.arrayOfReference) {
                    type = <a href={getReferenceUrl(typeName)} title={typeName}>{typeName + (property.type.displayAs === TPropertyDisplayAs.arrayOfReference ? "[]" : "")}</a>;
                } else {
                    type = <span>{typeName + (property.type.displayAs === TPropertyDisplayAs.arrayOfPrimitive ? "[]" : "")}</span>;
                }

                return (
                    <TableRow key={property.name} className={"fui-table-body-row"}>
                        <TableCell><span className={"truncate-text"} title={property.name}>{property.name}</span></TableCell>
                        <TableCell><TypeBadge value={property.required ? "true" : "false"} /></TableCell>
                        {definition.readOnly && <TableCell><span>{property.readOnly}</span></TableCell>}
                        <TableCell><TypeBadge className={"truncate-text"} value={type} /></TableCell>
                        <TableCell><div title={property.description}>
                            <MarkdownRenderer markdown={property.description} maxLength={100} shouldTruncate={true} />
                        </div></TableCell>
                        {showExamples && 
                            <TableCell>
                                {!!property.example && <span className={"truncate-text td-example"} title={property.example}>{property.example}</span>}
                            </TableCell>
                        }
                    </TableRow>
                );
            })}
        />
    );
}
