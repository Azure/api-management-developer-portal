import { SchemaObjectContract } from "../contracts/schema";


export class TypeDefinitionPropertyType {
    /**
     * e.g. "string", "boolean", "object", etc.
     */
    public name: string;

    /**
     * Indicates if the type name inferred from reference ($ref: "#/definitions/Pet").
     */
    public isReference: boolean;

    /**
     * Indicates if this is an array of the type.
     */
    public isArray: boolean;

    constructor(name: string, isReference: boolean = false, isArray: boolean = false) {
        this.name = name;
        this.isReference = isReference;
        this.isArray = isArray;
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
     * Definition example format, mostly used for syntax highlight, e.g. "json", "xml", "plain".
     */
    public exampleFormat?: string = "json";

    /**
     * Defines if this property is required.
     */
    public required?: boolean;

    /**
     * Hints if the this property is array of "type".
     */
    public isArray: boolean;

    /**
     * List of allowed values.
     */
    public enum: any[];


    constructor(name: string, contract: SchemaObjectContract, isRequired: boolean, isArray: boolean) {
        this.name = contract.title || name;
        this.description = contract.description;
        this.type = new TypeDefinitionPropertyType(contract.format || contract.type || "object");
        this.isArray = isArray;

        if (contract.example) {
            if (typeof contract.example === "object") {
                this.example = JSON.stringify(contract.example, null, 4);
            }
            else {
                this.example = contract.example;
            }
        }

        this.required = isRequired;
    }
}

export class TypeDefinitionPrimitiveProperty extends TypeDefinitionProperty {
    constructor(name: string, contract: SchemaObjectContract, isRequired: boolean, isArray: boolean = false) {
        super(name, contract, isRequired, isArray);

        this.kind = "primitive";
    }
}

export class TypeDefinitionEnumerationProperty extends TypeDefinitionProperty {
    constructor(name: string, contract: SchemaObjectContract, isRequired: boolean, isArray: boolean = false) {
        super(name, contract, isRequired, isArray);

        this.kind = "enum";
        this.enum = this.enum;
    }
}

export class TypeDefinitionObjectProperty extends TypeDefinitionProperty {
    /**
     * Object properties.
     */
    public properties?: TypeDefinitionProperty[];

    constructor(name: string, contract: SchemaObjectContract, isRequired: boolean, isArray: boolean = false) {
        super(name, contract, isRequired, isArray);

        this.kind = "object";

        if (contract.$ref) { // reference
            this.type = new TypeDefinitionPropertyType(this.getTypeNameFromRef(contract.$ref), true);
            return;
        }

        if (contract.items) { // indexer
            let type = new TypeDefinitionPropertyType("object");

            if (contract.items.type) {
                type = new TypeDefinitionPropertyType(contract.items.type);
            }

            if (contract.items.$ref) {
                type = new TypeDefinitionPropertyType(this.getTypeNameFromRef(contract.items.$ref), true);
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
            this.properties = Object
                .keys(contract.properties)
                .map(propertyName => {
                    const propertySchemaObject = contract.properties[propertyName];

                    if (!propertySchemaObject) {
                        return null;
                    }

                    const isRequired = contract.required?.includes(propertyName) || false;

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
                                return new TypeDefinitionEnumerationProperty(propertyName, propertySchemaObject, isRequired);
                            }

                            return new TypeDefinitionPrimitiveProperty(propertyName, propertySchemaObject, isRequired);
                            break;

                        case "object":
                            return new TypeDefinitionObjectProperty(propertyName, propertySchemaObject, isRequired, true);
                            break;

                        case "array":
                            const prop = new TypeDefinitionPrimitiveProperty(propertyName, propertySchemaObject, isRequired, true);

                            if (!propertySchemaObject.items) {
                                return prop;
                            }

                            if (propertySchemaObject.items.type) {
                                prop.type = new TypeDefinitionPropertyType(propertySchemaObject.items.type, false, true);
                            }

                            if (propertySchemaObject.items.$ref) {
                                prop.type = new TypeDefinitionPropertyType(this.getTypeNameFromRef(propertySchemaObject.items.$ref), true, true);
                            }

                            return prop;

                            break;

                        default:
                            console.warn(`Unknown type of schema definition: ${propertySchemaObject.type}`);
                    }
                })
                .filter(x => !!x);
        }
    }

    protected getTypeNameFromRef($ref: string): string {
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
    constructor(name: string, contract: SchemaObjectContract) {
        super(name, contract, true);

        this.name = name;
    }

    public toString(): string {
        return this.name;
    }
}
