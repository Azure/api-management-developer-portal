import { ParameterContract } from './parameter';

/**
 * Model of API operation payload representation
 */
export interface RepresentationContract {
    contentType: string;
    generatedSample?: string;
    schemaId?: string;
    typeName?: string;
    formParameters?: ParameterContract[];
}
