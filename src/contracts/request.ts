import { ParameterContract } from "./parameter";
import { RepresentationContract } from "./representation";

/*
Model of API operation request
*/
export interface RequestContract {
    /**
     * Operation request description.
     */
    description?: string;

    /**
     * Collection of operation request query parameters.
     */
    queryParameters: ParameterContract[];

    /**
     * Collection of operation request headers.
     */
    headers: ParameterContract[];

    /**
     * Collection of operation request representations.
     */
    representations: RepresentationContract[];
}
