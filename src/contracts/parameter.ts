/**
 * Model of API operation request parameter
 */
export interface ParameterContract {
    name: string;
    description?: string;
    type: string;
    defaultValue?: string;
    values?: string[];
    required: boolean;
}
