import { VersionSet } from "./versionSet";
import { ApiContract, SubscriptionKeyParameterName } from "../contracts/api";
import { Utils } from "../utils";

/**
 * API model.
 */
export class Api {
    public readonly id: string;

    public readonly name: string;

    /**
     * Display name of API, e.g. "HTTP Bin".
     */
    public displayName?: string;

    /**
     * Description of API.
     */
    public description?: string;

    /**
     * Version of API, e.g. "v1"
     */
    public apiVersion?: string;

    /**
     * Description of API version.
     */
    public apiVersionDescription?: string;

    /**
     * To be defined
     */
    public apiVersionSet?: VersionSet;

    /**
     * To be defined
     */
    public apiRevision?: string;

    /**
     * To be defined
     */
    public apiRevisionDescription?: string;

    /**
     * Web service URL "https://httpbin.org".
     */
    public serviceUrl?: string;

    /**
     * API URL suffix, e.g. "/httbin"
     */
    public path?: string;

    /**
     * Supported protocols, e.g. ["http", "https"]
     */
    public protocols?: string[];

    // proxyAuth?: string;
    // authenticationSettings?: AuthenticationSettings;
    public subscriptionKeyParameterNames?: SubscriptionKeyParameterName;

    public urlSuffix?: string;

    /**
     * To be defined
     */
    // public operations?: Operation[];

    /**
     * To be defined
     */
    public type?: string;

    /**
     * To be defined
     */
    public isCurrent?: boolean;

    constructor(contract?: ApiContract) {
        this.id = Utils.getResourceName("apis", contract.id, "shortId");
        this.name = contract.name;
        this.displayName = contract.properties.displayName;
        this.serviceUrl = contract.properties.serviceUrl;
        this.protocols = contract.properties.protocols;
        this.description = contract.properties.description;
        this.path = contract.properties.path;
        this.urlSuffix = contract.properties.urlSuffix;
        this.isCurrent = contract.properties.isCurrent;
        this.apiVersion = contract.properties.apiVersion || "Original";
        this.apiRevision = contract.properties.apiRevision;

        if (contract.properties.apiVersionSet) {
            const nestedVersionSet = contract.properties.apiVersionSet;
            const versionSet = new VersionSet(contract.properties.apiVersionSetId);
            versionSet.name = nestedVersionSet.name;
            versionSet.description = nestedVersionSet.description;
            versionSet.versionHeaderName = nestedVersionSet.versionHeaderName;
            versionSet.versionQueryName = nestedVersionSet.versionQueryName;
            versionSet.versioningScheme = nestedVersionSet.versioningScheme;

            this.apiVersionSet = versionSet;
        }
    }
}