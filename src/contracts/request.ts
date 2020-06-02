import { ParameterContract } from "./parameter";
import { RepresentationContract } from "./representation";

/*
Model of API operation request
*/
export interface RequestContract {
    description?: string;
    queryParameters: ParameterContract[];
    headers: ParameterContract[];
    representations: RepresentationContract[];
}
