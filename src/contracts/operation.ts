import { ParameterContract } from "./parameter";
import { RequestContract } from "./request";
import { ResponseContract } from "./response";

/**
 * Model of API operation
 */
export interface OperationContract {
    id: string;
    name: string;
    description: string;
    urlTemplate: string;
    templateParameters: ParameterContract[];
    method: string;
    backend?: string;
    version?: string;
    request?: RequestContract;
    responses?: ResponseContract[];
}