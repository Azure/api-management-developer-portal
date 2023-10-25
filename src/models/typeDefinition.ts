import { Bag } from "@paperbits/common/bag";
import { SchemaObjectContract } from "../contracts/schema";

export interface DestructedCombination {
    combinationType: string;
    combinationArray: SchemaObjectContract[];
}

export interface PropertiesObject {
    props: TypeDefinitionProperty[];
    hasReadOnly: boolean;
}

export interface ProcessedCombinationPropertiesObject {
    combinationReferenceObjectsArray: TypeDefinition[];
    combinationReferencesNames: string[];
    combinationOtherProperties: Bag<SchemaObjectContract>;
    combinationRequiredPropereties?: string[];
}

export type OperationExamples = Record<string, Record<string, Record<string, string>>>;

export abstract class TypeDefinitionPropertyType {
    public displayAs: string;

    constructor(displayAs: string) {
        this.displayAs = displayAs;
    }
}

export class TypeDefinitionPropertyTypePrimitive extends TypeDefinitionPropertyType {
    constructor(public readonly name: string) {
        super("primitive");
    }
}

export class TypeDefinitionPropertyTypeReference extends TypeDefinitionPropertyType {
    constructor(public readonly name: string) {
        super("reference");
    }
}

export class TypeDefinitionPropertyTypeArrayOfPrimitive extends TypeDefinitionPropertyType {
    constructor(public readonly name: string) {
        super("arrayOfPrimitive");
    }
}

export class TypeDefinitionPropertyTypeArrayOfReference extends TypeDefinitionPropertyType {
    constructor(public name: string) {
        super("arrayOfReference");
    }
}

export class TypeDefinitionPropertyTypeCombination extends TypeDefinitionPropertyType {
    constructor(
        public readonly combinationType: string,
        public readonly combinationReferences?: string[],
        public readonly combination?: TypeDefinitionPropertyType[]
    ) {
        super("combination");
    }
}

export abstract class TypeDefinitionProperty {
    /**
     * Type definition name.
     */
    public name: string;

    /**
     * Type definition description.
     */
    public description: string;

    /**
     * e.g. "string", "boolean", "object", etc.
     */
    public type?: TypeDefinitionPropertyType;

    /**
     * e.g. "primitive", "object", "array".
     */
    public kind?: string;

    /**
     * Definition example.
     */
    public example?: string;

    /**
     * Defines if this property is required.
     */
    public required?: boolean;

    /**
     * Defines if this property has a read-only status.
     */
     public readOnly?: boolean;

    /**
     * List of allowed values.
     */
    public enum: any[];

    /**
     * Raw schema representation.
     */
    public rawSchema: string;

    /**
     *  Raw schema format. It is used for syntax highlighting.
     */
    public rawSchemaFormat: string;

    constructor(name: string, contract: SchemaObjectContract, isRequired: boolean) {
        this.name = contract.title || name;
        this.description = contract.description;
        this.readOnly = contract.readOnly ?? false;
        this.required = isRequired;

        const typeAndFormat = 
            contract.type 
                ? contract.format ? contract.type + " (" + contract.format + ")" : contract.type
                : "object";
        this.type = new TypeDefinitionPropertyTypePrimitive(typeAndFormat);

        if (contract.rawSchemaFormat) {
            this.rawSchema = contract.rawSchema;
            this.rawSchemaFormat = contract.rawSchemaFormat;
        }
        else { // fallback to JSON
            this.rawSchema = JSON.stringify(contract, null, 4);
            this.rawSchemaFormat = "json";
        }
    }

    protected getTypeNameFromRef($ref: string): string {
        return $ref && $ref.split("/").pop();
    }

    protected destructCombination(contract: SchemaObjectContract): DestructedCombination {
        let combinationType: string;
        let combinationArray: SchemaObjectContract[];

        if (contract.allOf) {
            combinationType = "All of";
            combinationArray = contract.allOf;
        }

        if (contract.anyOf) {
            combinationType = "Any of";
            combinationArray = contract.anyOf;
        }

        if (contract.oneOf) {
            combinationType = "One of";
            combinationArray = contract.oneOf;
        }

        if (contract.not) {
            combinationType = "Not";
            combinationArray = contract.not;
        }

        if (contract.properties) {
            combinationArray.push({ properties: contract.properties });
        }

        return {
            combinationType,
            combinationArray
        };
    }
}

export class TypeDefinitionPrimitiveProperty extends TypeDefinitionProperty {
    constructor(name: string, contract: SchemaObjectContract, isRequired: boolean) {
        super(name, contract, isRequired);

        this.kind = "primitive";
    }
}

export class TypeDefinitionEnumerationProperty extends TypeDefinitionProperty {
    constructor(name: string, contract: SchemaObjectContract, isRequired: boolean) {
        super(name, contract, isRequired);

        this.kind = "enum";
    }
}

export class TypeDefinitionCombinationProperty extends TypeDefinitionProperty {
    constructor(name: string, contract: SchemaObjectContract, isRequired: boolean) {
        super(name, contract, isRequired);

        const { combinationType, combinationArray } = this.destructCombination(contract);

        const combination = combinationArray.map(item => {
            if (item.$ref) {
                return new TypeDefinitionPropertyTypeReference(this.getTypeNameFromRef(item.$ref));
            }

            return new TypeDefinitionPropertyTypePrimitive(item.type || "object");
        });

        this.type = new TypeDefinitionPropertyTypeCombination(combinationType, null, combination);
        this.kind = "combination";
    }
}

export class TypeDefinitionObjectProperty extends TypeDefinitionProperty {
    /**
     * Object properties.
     */
    public properties?: TypeDefinitionProperty[];

    constructor(name: string, contract: SchemaObjectContract, isRequired: boolean, nested: boolean = false, definitions: object = {}) {
        super(name, contract, isRequired);

        this.kind = "object";

        if (contract.$ref) { // reference
            const refName = this.getTypeNameFromRef(contract.$ref);

            this.type = new TypeDefinitionPropertyTypeReference(refName);
            this.description = definitions[refName] ? definitions[refName].description ?? "" : "";
            return;
        }

        if (contract.type === "array" && contract.items) {
            if (contract.items.$ref) {
                const arrayProperty = new TypeDefinitionPrimitiveProperty("[]", contract, isRequired);
                arrayProperty.type = new TypeDefinitionPropertyTypeArrayOfReference(this.getTypeNameFromRef(contract.items.$ref));
                this.properties = [arrayProperty];
            } else if (contract.items.properties) {
                const { props, hasReadOnly } = this.processProperties(contract.items, nested, definitions, "[]");
                this.properties = props;
                this.readOnly = hasReadOnly;
            }

            this.kind = "array";
            return;
        }

        if (contract.items) { // indexer
            let type = new TypeDefinitionPropertyTypePrimitive("object");

            if (contract.items.type) {
                type = new TypeDefinitionPropertyTypePrimitive(contract.items.type);
            }

            if (contract.items.$ref) {
                type = new TypeDefinitionPropertyTypeReference(this.getTypeNameFromRef(contract.items.$ref));
            }

            this.properties = [new TypeDefinitionIndexerProperty(type)];
            this.kind = "indexer";
            return;
        }

        if (contract.enum) { // enumeration
            this.enum = contract.enum;
            this.kind = "enum";
        }

        if (contract.properties) { // complex type
            const { props, hasReadOnly } = this.processProperties(contract, nested, definitions);
            this.properties = props;
            this.readOnly = hasReadOnly;
        }

        if (contract.allOf ||
            contract.anyOf ||
            contract.oneOf
        ) {
            const { combinationType, combinationArray } = this.destructCombination(contract);

            const processedCombinationPropertiesObject: ProcessedCombinationPropertiesObject = {
                combinationReferenceObjectsArray: [],
                combinationReferencesNames: [],
                combinationOtherProperties: {},
                combinationRequiredPropereties: contract.required || []
            };

            let processedTypeDefinitionsArray: TypeDefinition[] = [];

            const combinationPropertiesProcessed = this.processCombinationProperties(combinationArray, definitions, processedCombinationPropertiesObject);
            processedTypeDefinitionsArray = combinationPropertiesProcessed.combinationReferenceObjectsArray;
            processedTypeDefinitionsArray.push(
                new TypeDefinition(
                    "Other properties",
                    {
                        properties: combinationPropertiesProcessed.combinationOtherProperties,
                        required: combinationPropertiesProcessed.combinationRequiredPropereties
                    },
                    definitions
                ));

            this.kind = "combination";
            this.type = new TypeDefinitionPropertyTypeCombination(combinationType, combinationPropertiesProcessed.combinationReferencesNames);
            this.properties = processedTypeDefinitionsArray;
        }
    }

    private processCombinationProperties(
        combinationArray: SchemaObjectContract[],
        definitions: object,
        processedCombinationPropertiesObject?: ProcessedCombinationPropertiesObject
    ): ProcessedCombinationPropertiesObject {
        combinationArray.map((combinationArrayItem) => {
            if (combinationArrayItem.allOf || combinationArrayItem.anyOf || combinationArrayItem.oneOf) {
                const { combinationType, combinationArray } = this.destructCombination(combinationArrayItem);
                processedCombinationPropertiesObject = this.processCombinationProperties(combinationArray, definitions, processedCombinationPropertiesObject);
            }

            if (combinationArrayItem.$ref) {
                const combinationReferenceName = this.getTypeNameFromRef(combinationArrayItem.$ref);
                processedCombinationPropertiesObject.combinationReferencesNames.push(combinationReferenceName);

                processedCombinationPropertiesObject.combinationReferenceObjectsArray.push(new TypeDefinition(combinationReferenceName, definitions[combinationReferenceName], definitions));
            }

            if (combinationArrayItem.required) {
                processedCombinationPropertiesObject.combinationRequiredPropereties.push(...combinationArrayItem.required);
            }

            if (combinationArrayItem.properties) {
                processedCombinationPropertiesObject.combinationOtherProperties = { ...processedCombinationPropertiesObject.combinationOtherProperties, ...combinationArrayItem.properties };
            }
        });

        return processedCombinationPropertiesObject;
    }

    private flattenNestedObjects(nested: TypeDefinitionObjectProperty, prefix: string): TypeDefinitionProperty[] {
        const result = [];

        if (!nested.properties) {
            nested.name = prefix;
            result.push(nested);
            return result;
        }

        nested.properties.forEach(property => {
            if (property instanceof TypeDefinitionObjectProperty) {
                result.push(...this.flattenNestedObjects(<TypeDefinitionObjectProperty>property, prefix + "." + property.name));
            }
            else {
                property.name = prefix + "." + property.name;
                result.push(property);
            }
        });

        return result;
    }

    private processProperties(item: SchemaObjectContract, nested: boolean, definitions: object, prefix?: string): PropertiesObject {
        const props = [];
        let hasReadOnly = false;

        if (!item.properties) {
            return;
        }

        Object
            .keys(item.properties)
            .forEach(propertyName => {
                try {
                    const propertySchemaObject = item.properties[propertyName];
                    const propertyNameToDisplay = (prefix ? prefix + "." : "") + propertyName;

                    if (!hasReadOnly) hasReadOnly = propertySchemaObject.readOnly ?? false;

                    if (!propertySchemaObject) {
                        return;
                    }

                    const isRequired = item.required?.includes(propertyName) || false;

                    if (propertySchemaObject.$ref) {
                        propertySchemaObject.type = "object";
                    }

                    if (propertySchemaObject.items) {
                        propertySchemaObject.type = "array";
                    }

                    if (propertySchemaObject.allOf ||
                        propertySchemaObject.anyOf ||
                        propertySchemaObject.oneOf ||
                        propertySchemaObject.not
                    ) {
                        propertySchemaObject.type = "combination";
                    }

                    switch (propertySchemaObject.type) {
                        case "integer":
                        case "number":
                        case "string":
                        case "boolean":
                            if (propertySchemaObject.enum) {
                                props.push(new TypeDefinitionEnumerationProperty(propertyNameToDisplay, propertySchemaObject, isRequired));
                            }
                            else {
                                props.push(new TypeDefinitionPrimitiveProperty(propertyNameToDisplay, propertySchemaObject, isRequired));
                            }

                            break;

                        case "object": {
                            const objectProperty = new TypeDefinitionObjectProperty(propertyNameToDisplay, propertySchemaObject, isRequired, true, definitions);

                            if (!propertySchemaObject.$ref && propertySchemaObject.properties && !nested) {
                                const flattenObjects = this.flattenNestedObjects(objectProperty, propertyNameToDisplay);
                                props.push(...flattenObjects);
                            }
                            else {
                                props.push(objectProperty);
                            }
                            break;
                        }

                        case "array": {
                            const arrayProperty = new TypeDefinitionPrimitiveProperty(propertyNameToDisplay, propertySchemaObject, isRequired);

                            if (!propertySchemaObject.items) {
                                return arrayProperty;
                            }

                            if (propertySchemaObject.items.$ref) {
                                arrayProperty.type = new TypeDefinitionPropertyTypeArrayOfReference(this.getTypeNameFromRef(propertySchemaObject.items.$ref));
                                props.push(arrayProperty);
                            }
                            else if (propertySchemaObject.items.properties) {
                                const objectProperty = new TypeDefinitionObjectProperty(propertyNameToDisplay, propertySchemaObject.items, isRequired, true, definitions);
                                const flattenObjects = this.flattenNestedObjects(objectProperty, propertyNameToDisplay + "[]");
                                props.push(...flattenObjects);
                            }
                            else if (propertySchemaObject.items.type) {
                                arrayProperty.type = new TypeDefinitionPropertyTypeArrayOfPrimitive(propertySchemaObject.items.type);
                                props.push(arrayProperty);
                            }
                            else {
                                const objectProperty = new TypeDefinitionObjectProperty(propertyNameToDisplay + "[]", propertySchemaObject.items, isRequired, true, definitions);
                                props.push(objectProperty);
                            }

                            break;
                        }

                        case "combination":
                            props.push(new TypeDefinitionCombinationProperty(propertyNameToDisplay, propertySchemaObject, isRequired));
                            break;

                        default:
                            console.warn(`Unknown type of schema definition: ${propertySchemaObject.type}`);
                    }
                }
                catch (error) {
                    console.warn(`Unable to process object property ${propertyName}. Error: ${error}`);
                }
            });

        return {
            props,
            hasReadOnly
        };
    }
}

export class TypeDefinitionIndexerProperty extends TypeDefinitionObjectProperty {
    constructor(type: TypeDefinitionPropertyType) {
        super("[]", {}, true);

        this.kind = "indexer";
        this.type = type;
    }
}

export class TypeDefinition extends TypeDefinitionObjectProperty {
    constructor(name: string, contract: SchemaObjectContract, definitions: object) {
        super(name, contract, true, false, definitions);
        this.name = name;
    }

    public toString(): string {
        return this.name;
    }
}
