import { Bag } from "@paperbits/common";
import { Example } from "./example";

/**
 * Model of API operation request parameter
 */
export interface ParameterContract {
    /**
     * Parameter name, e.g. api-version.
     */
    name: string;

    /**
     * Parameter description.
     */
    description: string;

    /**
     * Parameter placement, e.g. "query", "template", "header", "body".
     */
    in: string;

    /**
     * Parameter type, e.g. "string", "int64", etc.
     */
    type: string;

    /**
     * Parameter default value, e.g. "2018-06-01-preview".
     */
    defaultValue: string;

    /**
     * Parameter value suggestions, e.g. ["2016-07-07","2016-10-10", "2018-06-01-preview"]
     */
    values: string[];

    /**
     * Indicates if the parameter is required to make a request.
     */
    required: boolean;

    /**
     * Object containing examples of the parameter.
     */
    examples: Bag<Example>;
}
