import * as React from "react";
import { useEffect, useState } from "react";
import { Stack } from "@fluentui/react";
import { Body1, Dropdown, Option, Tab, TabList } from "@fluentui/react-components";
import { KnownMimeTypes } from "../../../../../models/knownMimeTypes";
import { Representation } from "../../../../../models/representation";
import { TypeDefinition } from "../../../../../models/typeDefinition";
import { RepresentationExample } from "../../../../../models/representationExample";
import { Utils } from "../../../../../utils";
import { OperationDetailsTable } from "./utils";
import { CodeSnippet } from "../../../../utils/react/CodeSnippet";
import { TypeDefinitionForRepresentation } from "./TypeDefinitions";

type OperationRepresentationProps = {
    definitions: TypeDefinition[];
    representations: Representation[];
    showExamples: boolean;
    defaultSchemaView: TSchemaView;
    getReferenceUrl: (reference: string) => string;
}

export enum TSchemaView {
    schema = "raw",
    table = "table"
}

export const getDefinitionForRepresentation = (representation: Representation, definitions: TypeDefinition[]): TypeDefinition => {
    let definition = definitions.find(x => x.name === representation.typeName);

    if (!definition) {
        // Fallback for the case when type is referenced, but not defined in schema
        return new TypeDefinition(representation.typeName, {}, definitions);
    }

    // Making copy to avoid overriding original properties
    definition = Utils.clone(definition);

    if (!definition.name) {
        definition.name = representation.typeName;
    }

    return definition;
}

export const OperationRepresentation = ({ definitions, representations, showExamples, defaultSchemaView, getReferenceUrl }: OperationRepresentationProps) => {
    const [schemaView, setSchemaView] = useState<TSchemaView>(defaultSchemaView || TSchemaView.table);
    const [selectedRepresentation, setSelectedRepresentation] = useState<Representation>(representations[0]);
    const [selectedRepresentationDefinition, setSelectedRepresentationDefinition] = useState<TypeDefinition>(null);
    const [selectedRepresentationExample, setSelectedRepresentationExample] = useState<RepresentationExample>(null);

    useEffect(() => {
        setSelectedRepresentationExample(selectedRepresentation.examples?.[0]);
        setSelectedRepresentationDefinition(getDefinitionForRepresentation(selectedRepresentation, definitions));
        console.log("selectedRepresentation", selectedRepresentation);
    }, [representations, definitions, selectedRepresentation]);

    return (
        <>
            <Stack horizontal horizontalAlign="space-between" className={"operation-body"}>
                <TabList selectedValue={schemaView} onTabSelect={(e, data: { value: TSchemaView }) => setSchemaView(data.value)}>
                    <Tab value={TSchemaView.table}>Table</Tab>
                    {selectedRepresentation.contentType !== KnownMimeTypes.FormData && <Tab value={TSchemaView.schema}>Schema</Tab>}
                </TabList>
                <Stack horizontal verticalAlign="center">
                    <Body1>Content type</Body1>
                    <Dropdown
                        value={selectedRepresentation.contentType}
                        selectedOptions={[selectedRepresentation.contentType]}
                        size="small"
                        className={"operation-content-type-dropdown"}
                        onOptionSelect={(e, data) => {
                            const newSelectedRepresentation = representations.find(x => x.contentType === data.optionValue);
                            setSelectedRepresentation(newSelectedRepresentation);
                            newSelectedRepresentation.contentType === KnownMimeTypes.FormData && setSchemaView(TSchemaView.table);
                        }}
                    >
                        {representations.map(representation => (
                            <Option key={representation.contentType} value={representation.contentType}>{representation.contentType}</Option>
                        ))}
                    </Dropdown>
                </Stack>
            </Stack>
            {selectedRepresentation.formParameters?.length > 0
                ? <OperationDetailsTable
                    tableName={"Request body table"}
                    tableContent={selectedRepresentation.formParameters}
                    showExamples={false}
                    showIn={false}
                    />
                : selectedRepresentationDefinition &&
                    (schemaView === TSchemaView.schema
                        ? <CodeSnippet
                            name={selectedRepresentationDefinition.name}
                            content={selectedRepresentationDefinition.rawSchema}
                            format={selectedRepresentationDefinition.rawSchemaFormat}
                        />
                        : <TypeDefinitionForRepresentation
                            definition={selectedRepresentationDefinition}
                            showExamples={showExamples}
                            getReferenceUrl={getReferenceUrl}
                        />
                    )
            }
            {selectedRepresentationExample &&
                <>
                    <Stack className={"operation-body"}>
                        <TabList
                            selectedValue={selectedRepresentationExample.title}
                            onTabSelect={(e, data: { value: string }) =>
                                setSelectedRepresentationExample(selectedRepresentation.examples.find(x => x.title === data.value))
                            }>
                            {selectedRepresentation.examples.map(example => (
                                <Tab key={example.title} value={example.title}>{example.title ?? "Default"}</Tab>
                            ))}
                        </TabList>
                    </Stack>
                    <CodeSnippet example={selectedRepresentationExample} />
                </>
            }
        </>
    );
}
