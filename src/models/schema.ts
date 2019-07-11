import { SchemaContract, SchemaDocumentContract, SchemaObjectContract, ReferenceObjectContract } from "../contracts/schema";

export class Schema {
    public definitions: SchemaObject[];

    constructor(contract?: SchemaContract) {
        this.definitions = [];

        if (contract.properties.document && contract.properties.document.definitions) {
            this.definitions = Object
                .keys(contract.properties.document.definitions)
                .map(definitionName => {
                    return new SchemaObject(definitionName, contract.properties.document.definitions[definitionName]);
                });
        }
    }
}

export class SchemaDocument {
    public definitions?: Object;

    constructor(contract: SchemaDocumentContract) {
        this.definitions = contract.definitions;
    }
}

export class SchemaObject {
    public name: string;
    public description: string;
    public type: string;
    public properties?: SchemaObject[];
    public $ref: string;

    constructor(name: string, contract?: SchemaObjectContract) {
        this.name = name;

        if (!contract) {
            return;
        }

        this.description = contract.description;
        this.$ref = contract.$ref;

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
                        this.properties = Object
                            .keys(contract.properties)
                            .map(propertyName => new SchemaObject(propertyName, contract.properties[propertyName]));
                    }
                    break;

                case "array":
                    if (contract.items) {
                        this.properties = [new SchemaObject("[]", contract.items)];
                    }
                    break;

                default:
                    debugger;
                    console.warn(`Unknown type of schema definition: ${contract.type}`);
            }
        }
    }

    public toString(): string {
        return this.name;
    }
}