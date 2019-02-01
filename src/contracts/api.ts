import { OperationContract } from "./operation";
import { VersionSetContract } from "./apiVersionSet";
import { AuthenticationSettings } from "./authenticationSettings";

/**
 * Cotract of API
 */
export interface ApiContract {
    id?: string;
    name?: string;
    description?: string;
    apiVersion?: string;
    apiVersionDescription?: string;
    apiVersionSetId?: string;
    apiVersionSet?: VersionSetContract;
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
}

export interface SubscriptionKeyParameterName {
    header: string;
    query: string;
}

