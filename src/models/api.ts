import { VersionSet } from "./versionSet";
import { ApiContract, SubscriptionKeyParameterName } from "../contracts/api";
import { Operation } from "./operation";
import { Utils } from "../utils";

/**
 * API
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
        this.id = contract.id;
        this.name = Utils.getResourceName("apis", contract.id);
        this.displayName = contract.name;
        this.serviceUrl = contract.serviceUrl;
        this.protocols = contract.protocols;
        this.description = contract.description;
        this.path = contract.path;
        this.urlSuffix = contract.urlSuffix;
        this.isCurrent = contract.isCurrent;
        this.apiVersion = contract.apiVersion || "Original";
        this.apiRevision = contract.apiRevision;

        if (contract.apiVersionSet) {
            this.apiVersionSet = new VersionSet(contract.apiVersionSet);
        }
    }
}