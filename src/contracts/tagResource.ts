import { ApiContract } from "./api";
import { OperationContract } from "./operation";
import { TagContract } from "./tag";


/**
 * Cotract of TagResource
 */
export interface TagResourceContract {
    api?: ApiContract;
    operation?: OperationContract;
    tag?: TagContract;
}
