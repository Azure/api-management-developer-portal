import { AuthenticationSettings } from "./authenticationSettings";
import { ArmResource } from "./armResource";

/**
 * Cotract of API
 */
export interface ApiContract extends ArmResource {
    properties: ApiProperties;
}

export interface ApiProperties {
    /**
     * API name. Must be 1 to 300 characters long.
     */
    displayName?: string;

    /**
     * Description of the API. May include HTML formatting tags.
     */
    description?: string;

    /**
     * Indicates the Version identifier of the API if the API is versioned.
     */
    apiVersion?: string;

    /**
     * Description of the API Version.
     */
    apiVersionDescription?: string;

    /**
     * A resource identifier for the related API version set.
     */
    apiVersionSetId?: string;

    /**
     * Version set details.
     */
    apiVersionSet?: {
        name: string,
        description: string,
        versioningScheme: string,
        versionQueryName: string,
        versionHeaderName: string
    };

    /**
     * Describes the Revision of the Api. If no value is provided, default revision 1 is created.
     */
    apiRevision?: string;

    /**
     * Description of the Api Revision.
     */
    apiRevisionDescription?: string;

    /**
     * Absolute URL of the backend service implementing this API. Cannot be more than 2000 characters long.
     */
    serviceUrl?: string;

    /**
     * Relative URL uniquely identifying this API and all of its resource paths within the API Management
     * service instance. It is appended to the API endpoint base URL specified during the service instance
     * creation to form a public URL for this API.
     */
    path?: string;

    /**
     * Describes on which protocols the operations in this API can be invoked.
     */
    protocols?: string[];

    /**
     * API Authentication Settings.
     */
    authenticationSettings?: AuthenticationSettings;

    /**
     * Subscription key parameter names details.
     */
    subscriptionKeyParameterNames?: SubscriptionKeyParameterName;

    /**
     * Type of API, e.g. "http" or "soap".
     */
    type?: string;

    /**
     * Indicates if API revision is current api revision.
     */
    isCurrent?: boolean;

    /**
     * Specifies whether an API or Product subscription is required for accessing the API.
     */
    subscriptionRequired: boolean;

    /**
     * Contact information.
     */
    contact?: ContactDetails;

    /**
     * Name of the license and a URL to the license description.
     */
    license?: LicenseDetails;

    /**
     * Link to the page that describes the terms of service. Must be in the URL format.
     */
    termsOfServiceUrl?: string;
}


export interface SubscriptionKeyParameterName {
    header: string;
    query: string;
}

export interface ContactDetails {
    name?: string;
    email?: string;
    url?: string;
}

export interface LicenseDetails {
    name: string;
    url: string;
}
