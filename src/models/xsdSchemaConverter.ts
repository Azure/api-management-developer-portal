import { JObject } from "./jObject";
import { SchemaObjectContract } from "../contracts/schema";
import { Bag } from "@paperbits/common";

interface SchemaNode {
    name: string;
    definition?: any;
}

/**
 * Basic XSD to internal schema representation converter.
 */
export class XsdSchemaConverter {
    /**
     * Determines if specified type is built-in primitive type.
     * @param type {string} Type name.
     */
    private isPrimitiveType(type: string): boolean {
        return [
            "anySimpleType",
            "anyType",
            "string",
            "normalizedString",
            "token",
            "language",
            "Name",
            "NCName",
            "ID",
            "IDREF",
            "IDREFS",
            "ENTITY",
            "ENTITIES",
            "NMTOKEN",
            "NMTOKENS",
            "boolean",
            "base64Binary",
            "hexBinary",
            "float",
            "decimal",
            "integer",
            "nonPositiveInteger",
            "negativeInteger",
            "long",
            "int",
            "short",
            "byte",
            "nonNegativeInteger",
            "unsignedLong",
            "unsignedInt",
            "unsignedShort",
            "unsignedByte",
            "positiveInteger",
            "double",
            "anyURI",
            "QName",
            "duration",
            "dateTime",
            "date",
            "time",
            "anySimpleType",
            "anyType",
            "string",
            "normalizedString",
            "token",
            "language",
            "Name",
            "NCName",
            "ID",
            "IDREF",
            "IDREFS",
            "ENTITY",
            "ENTITIES",
            "NMTOKEN",
            "NMTOKENS",
            "boolean",
            "base64Binary",
            "hexBinary",
            "float",
            "decimal",
            "integer",
            "nonPositiveInteger",
            "negativeInteger",
            "long",
            "int",
            "short",
            "byte",
            "nonNegativeInteger",
            "unsignedLong",
            "unsignedInt",
            "unsignedShort",
            "unsignedByte",
            "positiveInteger",
            "double",
            "anyURI",
            "QName",
            "duration",
            "dateTime",
            "date",
            "time",
        ].includes(type);
    }

    /**
     * Converts XSD element into schema node.
     * @param jObject {JObject} JObject representing XSD element.
     */
    private convertElement(jObject: JObject): SchemaNode {
        const name = jObject.getAttribute("name");
        const originalType = jObject.getAttribute("type");
        const isPrimitive = this.isPrimitiveType(originalType);

        let type: string;
        let $ref: string;

        if (isPrimitive) {
            type = originalType;
            $ref = undefined;
        }
        else {
            type = "object";
            $ref = originalType?.split(":").pop();
        }

        const definition: SchemaObjectContract = {
            type: type,
            properties: undefined,
            $ref: $ref,
            rawSchema: jObject.toXml().trim(),
            rawSchemaFormat: "xml"
        };

        jObject.children.forEach(child => {
            switch (child.name) {
                case "simpleType":
                    definition.properties = definition.properties || {};
                    const simpleTypeNode = this.convertSimpleType(child);
                    definition.properties[simpleTypeNode.name] = simpleTypeNode.definition;
                    break;

                case "complexType":
                    const complexTypeNode = this.convertComplexType(child);
                    if (complexTypeNode.name) {
                        definition.properties = definition.properties || {};
                        definition.properties[complexTypeNode.name] = complexTypeNode.definition;
                    }
                    else {
                        Object.assign(definition, complexTypeNode.definition);
                    }

                    break;

                case "element":
                    const elementNode = this.convertElement(child);
                    definition.properties = definition.properties || {};
                    definition.properties[elementNode.name] = elementNode.definition;
                    break;

                default:
                    console.warn(`Element "${child.name}" by XSD schema converter.`);
                    break;
            }
        });

        const resultNode: SchemaNode = {
            name: name,
            definition: definition
        };

        return resultNode;
    }

    /**
     * Converts XSD simple type into schema node.
     * @param jObject {JObject} JObject representing XSD simple type.
     */
    private convertSimpleType(jObject: JObject): SchemaNode {
        const restriction = jObject.children[0];
        const type = restriction.getAttribute("base").split(":").pop();

        const definition: SchemaObjectContract = {
            type: type,
            rawSchema: jObject.toXml().trim(),
            rawSchemaFormat: "xml"
        };

        const resultNode: SchemaNode = {
            name: jObject.getAttribute("name"),
            definition: definition
        };

        return resultNode;
    }

    /**
     * Converts XSD simple type into schema node
     * @param jObject {JObject} JObject representing XSD complex type.
     */
    private convertComplexType(jObject: JObject): SchemaNode {
        const name = jObject.getAttribute("name");

        const definition: SchemaObjectContract = {
            type: "object"
        };

        const collection = jObject.children.find(x => x.name === "sequence" || x.name === "all");

        collection?.children.forEach(x => {
            const elementNode = this.convertElement(x);
            definition.properties = definition.properties || {};
            definition.properties[elementNode.name] = elementNode.definition;
        });

        const resultNode: SchemaNode = {
            name: name,
            definition: definition
        };

        return resultNode;
    }

    /**
     * Converts XSD schema into internal schema representation.
     * @param xsdDocument {string} String containing XSD document.
     */
    public convertXsdSchema(xsdDocument: string): Bag<SchemaObjectContract> {
        const documentJObject = JObject.fromXml(xsdDocument);

        const schemaJObject = documentJObject.children.find(x => x.name === "schema");

        if (!schemaJObject) {
            throw new Error(`Element "schema" not found in the document.`);
        }

        const schemaNode = this.convertElement(schemaJObject);

        return schemaNode.definition.properties;
    }
}
