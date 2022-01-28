import { SchemaObjectContract } from "../contracts/schema";

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
        public readonly combinationReferences: string[]
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
        this.type = new TypeDefinitionPropertyTypePrimitive(contract.format || contract.type || "object");
        this.required = isRequired;

        if (contract.rawSchemaFormat) {
            this.rawSchema = contract.rawSchema;
            this.rawSchemaFormat = contract.rawSchemaFormat;
        }
        else { // fallback to JSON
            this.rawSchema = JSON.stringify(contract, null, 4);
            this.rawSchemaFormat = "json";
        }
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
            this.description = definitions[refName].description ?? '';
            return;
        }

        if (contract.type === "array" && contract.items) {
            if (contract.items.$ref) {
                const arrayProperty = new TypeDefinitionPrimitiveProperty("[]", contract, isRequired);
                arrayProperty.type = new TypeDefinitionPropertyTypeArrayOfReference(this.getTypeNameFromRef(contract.items.$ref));
                this.properties = [arrayProperty];
            } else if (contract.items.properties) {
                this.properties = this.processProperties(contract.items, nested, definitions, "[]");
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
            this.properties = this.processProperties(contract, nested, definitions);
        }

        if (contract.allOf ||
            contract.anyOf ||
            contract.oneOf ||
            contract.not
        ) {
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

            const combinationPropertiesProcessed = this.processCombinationProperties(combinationArray, definitions);

            this.kind = "combination";
            this.type = new TypeDefinitionPropertyTypeCombination(combinationType, combinationPropertiesProcessed.combinationReferencesNames);
            this.properties = combinationPropertiesProcessed.combinationReferenceObjectsArray;
        }
    }

    private processCombinationProperties(combinationArray: SchemaObjectContract[], definitions: object) {
        const combinationReferenceObjectsArray: TypeDefinition[] = [];
        const combinationReferencesNames: string[] = [];

        combinationArray.map((combinationArrayItem) => {
            if (combinationArrayItem.$ref) {
                const combinationReferenceName = this.getTypeNameFromRef(combinationArrayItem.$ref);
                combinationReferencesNames.push(combinationReferenceName);

                combinationReferenceObjectsArray.push(new TypeDefinition(combinationReferenceName, definitions[combinationReferenceName], definitions))
            } else {
                combinationReferenceObjectsArray.push(new TypeDefinition("Custom properties", combinationArrayItem, definitions))
            }
        });

        return {
            combinationReferenceObjectsArray,
            combinationReferencesNames
        };
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

    private processProperties(item: SchemaObjectContract, nested: boolean, definitions: object, prefix?: string): TypeDefinitionProperty[] {
        const props = [];

        if (!item.properties) {
            return [];
        }

        Object
            .keys(item.properties)
            .forEach(propertyName => {
                try {
                    const propertySchemaObject = item.properties[propertyName];
                    const propertyNameToDisplay = (prefix ? prefix + "." : "") + propertyName;

                    if (!propertySchemaObject) {
                        return;
                    }

                    if (propertySchemaObject.readOnly) {
                        return;
                    }

                    const isRequired = item.required?.includes(propertyName) || false;

                    if (propertySchemaObject.$ref) {
                        propertySchemaObject.type = "object";
                    }

                    if (propertySchemaObject.items) {
                        propertySchemaObject.type = "array";
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

                        case "object":
                            const objectProperty = new TypeDefinitionObjectProperty(propertyNameToDisplay, propertySchemaObject, isRequired, true, definitions);

                            if (!propertySchemaObject.$ref && propertySchemaObject.properties && !nested) {
                                const flattenObjects = this.flattenNestedObjects(objectProperty, propertyNameToDisplay);
                                props.push(...flattenObjects);
                            }
                            else {
                                props.push(objectProperty);
                            }
                            break;

                        case "array":
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

                        default:
                            console.warn(`Unknown type of schema definition: ${propertySchemaObject.type}`);
                    }
                }
                catch (error) {
                    console.warn(`Unable to process object property ${propertyName}. Error: ${error}`);
                }
            });

        return props;
    }

    private getTypeNameFromRef($ref: string): string {
        return $ref && $ref.split("/").pop();
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
