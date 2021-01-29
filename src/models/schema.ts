import { XsdSchemaConverter } from "./xsdSchemaConverter";
import { SchemaContract, SchemaType, OpenApiSchemaContract, SwaggerSchemaContract, XsdSchemaContract } from "../contracts/schema";
import { TypeDefinition } from "./typeDefinition";

export class Schema {
    public definitions: TypeDefinition[];

    constructor(contract?: SchemaContract) {
        this.definitions = [];

        if (!contract) {
            return;
        }

        const definitionType = contract.properties?.contentType;
        let definitions = {};

        switch (definitionType) {
            case SchemaType.swagger:
                const swaggerDoc = <SwaggerSchemaContract>contract.properties?.document;
                definitions = swaggerDoc?.definitions || {};
                break;

            case SchemaType.openapi:
                const openApiDoc = <OpenApiSchemaContract>contract.properties?.document;
                definitions = openApiDoc?.components?.schemas || {};
                break;

            case SchemaType.xsd:
                const xsdDoc = <XsdSchemaContract>contract.properties?.document;

                try {
                    definitions = new XsdSchemaConverter().convertXsdSchema(xsdDoc.value);
                }
                catch (error) {
                    console.warn(`Unable to parse XSD schema document. Skipping type definition setup.`);
                }
                break;

            default:
                console.warn(`Unsupported schema type: ${definitionType}`);
        }

        this.definitions = Object.keys(definitions)
            .map(definitionName => {
                return new TypeDefinition(definitionName, definitions[definitionName]);
            });
    }
}