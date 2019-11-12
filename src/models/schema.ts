import { SchemaContract, SchemaObjectContract, SchemaType, OpenApiSchemaContract, SwaggerSchemaContract } from "../contracts/schema";

export class Schema {
    public definitions: TypeDefinition[];

    constructor(contract?: SchemaContract) {
        this.definitions = [];
        if (contract) {
            const definitionType = contract.properties?.contentType;
            let definitions = {};
            
            if (definitionType === SchemaType.swagger) {
                const swaggerDoc = <SwaggerSchemaContract>contract.properties?.document;
                definitions = swaggerDoc?.definitions;
            } else {
                if (definitionType === SchemaType.openapi) {
                    const openApiDoc = <OpenApiSchemaContract>contract.properties?.document;
                    definitions = openApiDoc?.components?.schemas;
                }
            }

            this.definitions = Object.keys(definitions)
                .map(definitionName => {
                    return new TypeDefinition(definitionName, definitions[definitionName]);
                });

        }
        
    }
}

export class TypeDefinition {
    public name: string;
    public description: string;
    public type: string;
    public required: boolean;
    public properties?: TypeDefinition[];
    public items?: TypeDefinition[];
    public $ref: string;
    public referencedTypeName?: string;
    public example: string;
    public enum?: string[];
    public uiType: string;

    constructor(name: string, contract?: SchemaObjectContract) {
        this.name = name;
        this.required = false; // TODO: Read from schema

        if (!contract) {
            return;
        }

        if (contract.example) {
            if (typeof contract.example === "object") {
                this.example = JSON.stringify(contract.example, null, 4);
            }
            else {
                this.example = contract.example;
            }
        }

        this.enum = contract.enum;

        this.description = contract.description;
        this.$ref = contract.$ref;
        this.type = contract.type;
        this.uiType = "primitive";
        this.referencedTypeName = this.getTypeNameFromRef(contract.$ref);

        if (contract.enum) {
            this.uiType = "enum";
        }

        if (contract.type) {
            switch (contract.type) {
                case "integer":
                case "number":
                case "string":
                case "boolean":
                    this.type = contract.format || contract.type;
                    break;

                case "object":
                    if (contract.properties) {
                        this.uiType = "object";
                        this.properties = Object
                            .keys(contract.properties)
                            .map(propertyName => new TypeDefinition(propertyName, contract.properties[propertyName]));
                    }
                    break;

                case "array":
                    this.uiType = "array";

                    if (contract.items) {
                        const indexerProperty: any = {
                            name: "[]",
                            type: "object",
                            uiType: "object",
                            description: contract.items.description,
                            referencedTypeName: this.getTypeNameFromRef(contract.items.$ref)
                        };

                        this.properties = [indexerProperty];
                    }
                    break;

                default:
                    console.warn(`Unknown type of schema definition: ${contract.type}`);
            }
        }
    }

    private getTypeNameFromRef($ref: string): string {
        return $ref && $ref.startsWith("#/definitions/") ? $ref.substring(14) : null;
    }

    public toString(): string {
        return this.name;
    }
}