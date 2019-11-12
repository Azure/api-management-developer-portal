import { SchemaContract, SchemaObjectContract, SchemaType, OpenApiSchemaContract, SwaggerSchemaContract } from "../contracts/schema";
import { TypeDefinition } from "./typeDefinition";

export class Schema {
    public definitions: TypeDefinition[];

    constructor(contract?: SchemaContract) {
        this.definitions = [];
        if (contract) {
            const definitionType = contract.properties?.contentType;
            let definitions = {};
            
            if (definitionType === SchemaType.swagger) {
                const swaggerDoc = <SwaggerSchemaContract>contract.properties?.document;
                definitions = swaggerDoc?.definitions || {};
            } else {
                if (definitionType === SchemaType.openapi) {
                    const openApiDoc = <OpenApiSchemaContract>contract.properties?.document;
                    definitions = openApiDoc?.components?.schemas || {};
                }
            }

            this.definitions = Object.keys(definitions)
                .map(definitionName => {
                    return new TypeDefinition(definitionName, definitions[definitionName]);
                });

        }
        
    }
}