import { ParameterContract } from "./parameter";

/**
 * Contract for API operation representation.
 */
export interface RepresentationContract {
    /**
     * Content type, e.g. application/json.
     */
    contentType: string;

    /**
     * User created sample.
     */
    sample?: string;

    /**
     * Sample generated during API import.
     */
    generatedSample?: string;

    /**
     * Identifier of the schema the representation belongs to.
     */
    schemaId?: string;

    /**
     * Name of the type describing representation.
     */
    typeName?: string;

    /**
     * Description of the form parameters, if the representation has form-like payload.
     */
    formParameters?: ParameterContract[];
}
