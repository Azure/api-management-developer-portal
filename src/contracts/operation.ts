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
     * Operation URI template. Cannot be more than 400 characters long.
     */
    urlTemplate: string;

    /**
     * Collection of URL template parameters.
     */
    templateParameters: ParameterContract[];

    /**
     * Operation method. Example: GET, POST, PUT, DELETE, etc.
     */
    method: string;

    backend?: string;

    version?: string;

    request?: RequestContract;

    /**
     * Array of Operation responses.
     */
    responses?: ResponseContract[];
}