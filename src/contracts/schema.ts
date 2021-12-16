
import { Bag } from "@paperbits/common";
import { ArmResource } from "./armResource";

export interface ReferenceObjectContract {
    $ref?: string;
}

/**
 * e.g. Pet
 */
export interface SchemaObjectContract extends ReferenceObjectContract {
    /**
     * e.g. "integer".
     */
    type?: string;

    /**
     * e.g. "int64"
     */
    format?: string;

    /**
     * e.g. "Pet object that needs to be added to the store".
     */
    description?: string;

    /**
     * e.g. ["name"].
     */
    required?: string[];

    readOnly?: boolean;

    properties?: Bag<SchemaObjectContract>;

    items?: SchemaObjectContract;

    allOf?: SchemaObjectContract[];

    anyOf?: SchemaObjectContract[];

    oneOf?: SchemaObjectContract[];

    not?: SchemaObjectContract[];

    minimum?: number;

    maximum?: number;

    enum?: string[];

    title?: string;

    multipleOf?;

    exclusiveMaximum?;

    exclusiveMinimum?;

    maxLength?;

    minLength?;

    pattern?;

    maxItems?;

    minItems?;

    uniqueItems?;

    maxProperties?: number;

    minProperties?: number;

    /**
     * Raw schema representation.
     */
    rawSchema?: string;

    /**
     * Raw schema format. It is used for syntax highlighting.
     */
    rawSchemaFormat?: string;
}

/**
 * A metadata object that allows for more fine-tuned XML model definitions.
 */
export interface XmlObject {
    /**
     * Replaces the name of the element/attribute used for the described schema property. 
     * When defined within items, it will affect the name of the individual XML elements within the list.
     * When defined alongside type being array (outside the items), it will affect the wrapping element and only if wrapped is true.
     * If wrapped is false, it will be ignored.
     */
    name?: string;

    /**
     * The URI of the namespace definition. Value MUST be in the form of an absolute URI.
     */
    namespace?: string;

    /**
     * The prefix to be used for the name.
     */
    prefix?: string;

    /**
     * Declares whether the property definition translates to an attribute instead of an element. Default value is false.
     */
    attribute?: boolean;

    /**
     * MAY be used only for an array definition. Signifies whether the array is wrapped (for example, <books><book/><book/></books>) or unwrapped (<book/><book/>).
     * Default value is false. The definition takes effect only when defined alongside type being array (outside the items).
     */
    wrapped?: boolean;
}

/**
 * 
 */
export interface SwaggerSchemaContract {
    definitions: Bag<SchemaObjectContract>;
}

export interface OpenApiSchemaContract {
    components: {
        schemas: Bag<SchemaObjectContract>;
    };
}

export interface XsdSchemaContract {
    value: string;
}

export interface GraphQLSchemaContract {
    value: string;
}

/**
 * 
 */
export interface SchemaContract extends ArmResource {
    properties: {
        contentType: string;
        document?: SwaggerSchemaContract | OpenApiSchemaContract | XsdSchemaContract | GraphQLSchemaContract;
    };
}

export enum SchemaType {
    swagger = "application/vnd.ms-azure-apim.swagger.definitions+json",
    openapi = "application/vnd.oai.openapi.components+json",
    xsd = "application/vnd.ms-azure-apim.xsd+xml",
    graphQL  = "application/vnd.ms-azure-apim.graphql.schema"
}