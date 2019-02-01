/**
 * Backend for HTTP request. 
 */
export interface Backend {
    description?: string;
    url: string;
    protocol: string;
    properties?: any;
    resourceId?: string;
}