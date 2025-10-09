
/**
 * Service environment settings fro editor.
 */
export interface IEditorSettings {
    /**
     * ARM endpoint host. example: management.azure.com
     */
    armEndpoint: string;
    
    /**
     * AAD ClientId. example: 4c6edb5e-d0fb-4ca1-ac29-8c181c1a9522
     */
    clientId: string;
    
    /**
     * AAD authority. example: https://login.windows-ppe.net/2083f1d9-e72c-4514-b8cc-13d228bcf8a6
     */
    tenantId: string;

    /**
     * Optional. AAD scopes. example: ["https://management.azure.com/.default"]
     */
    scopes?: string[];
}