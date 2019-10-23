import { RepresentationContract } from "./representation";
import { ParameterContract } from "./parameter";

/*
 * Model of API operation response
 */
export interface ResponseContract {
    headers?: ParameterContract[];
    statusCode: number;
    representations?: RepresentationContract[];
    description?: string;
}