
import { Bag } from "@paperbits/common";
import { ArmResource } from "./armResource";

export interface ReferenceObjectContract {
    $ref: string;
}

/**
 * e.g. Pet
 */
export interface SchemaObjectContract extends ReferenceObjectContract {
    /**
     * e.g. "integer".
     */
    type: string;

    /**
     * e.g. "int64"
     */
    format: string;

    /**
     * e.g. "Pet object that needs to be added to the store".
     */
    description: string;

    /**
     * e.g. ["name"].
     */
    required: string[];

    properties: Bag<SchemaObjectContract>;

    items: SchemaObjectContract;

    allOf: SchemaObjectContract;

    anyOf: SchemaObjectContract;

    not: SchemaObjectContract;

    minimum?: number;

    maximum?: number;

    enum: string[];

    title;

    multipleOf;

    exclusiveMaximum;

    exclusiveMinimum;

    maxLength;

    minLength;

    pattern;

    maxItems;

    minItems;

    uniqueItems;

    maxProperties;

    minProperties;
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
    name: string;

    /**
     * The URI of the namespace definition. Value MUST be in the form of an absolute URI.
     */
    namespace: string;

    /**
     * The prefix to be used for the name.
     */
    prefix: string;

    /**
     * Declares whether the property definition translates to an attribute instead of an element. Default value is false.
     */
    attribute: boolean;

    /**
     * MAY be used only for an array definition. Signifies whether the array is wrapped (for example, <books><book/><book/></books>) or unwrapped (<book/><book/>).
     * Default value is false. The definition takes effect only when defined alongside type being array (outside the items).
     */
    wrapped: boolean;
}

/**
 * 
 */
export interface SchemaDocumentContract {
    definitions: Bag<SchemaObjectContract>;
}

/**
 * 
 */
export interface SchemaContract extends ArmResource  {
    properties: {
        contentType: string;
        document?: SchemaDocumentContract;
    }
}