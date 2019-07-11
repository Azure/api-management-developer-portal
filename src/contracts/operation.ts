import { ParameterContract } from "./parameter";
import { RequestContract } from "./request";
import { ResponseContract } from "./response";
import { ArmResource } from "./armResource";

/**
 * Model of API operation
 */
export interface OperationContract extends ArmResource {
    properties: {
        displayName: string;
        description: string;
        urlTemplate: string;
        templateParameters: ParameterContract[];
        method: string;
        backend?: string;
        version?: string;
        request?: RequestContract;
        responses?: ResponseContract[];
    };
}