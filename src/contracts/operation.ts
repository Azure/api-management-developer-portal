import { ParameterContract } from "./parameter";
import { RequestContract } from "./request";
import { ResponseContract } from "./response";

/**
 * Model of API operation
 */
export interface OperationContract {

    /**
     * Operation identifier. e.g. "create-resource"
     */
    id: string;

    /**
     * Operation name.  Must be 1 to 300 characters long.
     */
    name: string;

    /**
     * Operation description.
     */
    description: string;

    /**
     * Operation method.
     */
    method: string;

    /**
     * Operation URI template. Cannot be more than 400 characters long.
     */
    urlTemplate: string;

    /**
     * Collection of URL template parameters.
     */
    templateParameters: ParameterContract[];

    /**
     * Operation version.
     */
    version?: string;

    /**
     * Containing request details.
     */
    request?: RequestContract;

    /**
     * Array of Operation responses.
     */
    responses?: ResponseContract[];
}