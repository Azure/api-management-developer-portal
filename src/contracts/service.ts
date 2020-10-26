export interface ServiceSku {
    /**
     * Example: Developer
     */
    name: string;

    /**
     * Example: 1
     */
    capacity: number;
}

export interface HostnameConfiguration {
    /**
     * Allowed values: Proxy, Portal, Management, Scm, Kudu
     */
    type: string;
    hostName: string;
    certificate: CertificateInformation;
}

export interface CertificateInformation {
    expiry: string;
    thumbprint: string;
    subject: string;
}

export interface ServiceProperties {
    publisherEmail: string;

    publisherName: string;

    /**
     * Example: Succeeded
     */
    provisioningState: string;

    targetProvisioningState: string;

    /**
     * Example: 2017-01-12T19:56:30.1611644Z
     */
    createdAtUtc: string;

    /**
     * Gateway endpoint, e.g. https://contoso.azure-api.net
     */
    gatewayUrl: string;

    /**
     * Direct management API endpoint, e.g. https://contoso.management.azure-api.net
     */
    managementApiUrl: string;

    /**
     * Example: https://contoso.scm.azure-api.net
     */
    scmUrl: string;

    hostnameConfigurations: HostnameConfiguration[];

    staticIps: string[];

    additionalLocations: string[];

    virtualNetworkConfiguration: Object;

    customProperties: Object;
}

export interface ServiceDescriptionContract {
    /**
     * Example: /subscriptions/a200340d-6b82-494d-9dbf-687ba6e33f9e/resourceGroups/Api-Default-West-US/providers/Microsoft.ApiManagement/service/contoso
     */
    id: string;

    tags: Object;

    /**
     * Example: West US
     */
    location: string;

    /**
     * Example: AAAAAABuOmI=,
     */
    etag: string;

    properties: ServiceProperties;    
    
    sku: ServiceSku;

    name: string;

    /**
     * Example: Microsoft.ApiManagement/service
     */
    type: string;
}