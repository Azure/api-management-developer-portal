import { ApiContract } from "./api";
import { OperationContract } from "./operation";
import { TagContract } from "./tag";


/**
 * Contract of TagResource
 */
export interface ApiTagResourceContract {
    api?: ApiContract;
    operation?: OperationContract;
    tag?: TagContract;
}
