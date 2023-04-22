import { RepresentationContract } from "./representation";
import { ParameterContract } from "./parameter";

/*
 * Model of API operation response
 */
export interface ResponseContract {
    /**
     * Collection of operation response headers.
     */
    headers?: ParameterContract[];

    /**
     * Operation response status code.
     */
    statusCode: number;

    /**
     * Collection of operation response representations.
     */
    representations?: RepresentationContract[];

    /**
     * Operation response description.
     */
    description?: string;
}