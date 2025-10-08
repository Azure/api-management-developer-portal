
/**
 * Service environment settings fro editor.
 */
export interface IEditorSettings {
    /**
     * the flag show is ARM authentication enabled
     */
    isArmAuthEnabled: boolean;
    
    /**
     * ARM endpoint host. example: api-dogfood.resources.windows-int.net
     */
    editorArmEndpoint: string;
    
    /**
     * AAD ClientId. example: 4c6edb5e-d0fb-4ca1-ac29-8c181c1a9522
     */
    editorAadClientId: string;
    
    /**
     * AAD authority. example: https://login.windows-ppe.net/2083f1d9-e72c-4514-b8cc-13d228bcf8a6
     */
    editorAadAuthority: string;

}