import { OperationContract } from "./operation";
import { AuthenticationSettings } from "./authenticationSettings";
import { ArmResource } from "./armResource";

/**
 * Cotract of API
 */
export interface ApiContract extends ArmResource {
    properties: ApiProperties;
}

export interface ApiProperties {
    displayName?: string;
    description?: string;
    apiVersion?: string;
    apiVersionDescription?: string;
    apiVersionSetId?: string;
    apiVersionSet?: {
        name: string,
        description: string,
        versioningScheme: string,
        versionQueryName: string,
        versionHeaderName: string
    };
    apiRevision?: string;
    apiRevisionDescription?: string;
    serviceUrl?: string;
    path?: string;
    protocols?: string[];
    proxyAuth?: string;
    authenticationSettings?: AuthenticationSettings;
    subscriptionKeyParameterNames?: SubscriptionKeyParameterName;
    urlSuffix?: string;
    operations?: OperationContract[];
    type?: string;
    isCurrent?: boolean;
    isOnline?: boolean;
    subscriptionRequired?: boolean;
}


export interface SubscriptionKeyParameterName {
    header: string;
    query: string;
}

