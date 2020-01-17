import { VersionSet } from "./versionSet";
import { ApiContract, SubscriptionKeyParameterName } from "../contracts/api";
import { Utils } from "../utils";

/**
 * API model.
 */
export class Api {
    /**
     * Unique ARM identifier.
     */
    public readonly id: string;

    /**
     * Unique API identifier.
     */
    public readonly name: string;

    /**
     * Display name of API, e.g. "HTTP Bin".
     */
    public displayName?: string;

    public versionedDisplayName?: string;

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
     * API URL suffix that contains API version, e.g. /httpbin/v2
     */
    public versionedPath?: string;

    /**
     * Supported protocols, e.g. ["http", "https"]
     */
    public protocols?: string[];

    public subscriptionKeyParameterNames?: SubscriptionKeyParameterName;

    public urlSuffix?: string;

    /**
     * Determines type of API, e.g. "soap".
     */
    public type?: string;

    constructor(contract?: ApiContract) {
        if (contract.id) {
            this.id = Utils.getResourceName("apis", contract.id, "shortId");
        }

        this.name = contract.name;
        this.displayName = contract.properties.displayName;
        this.versionedDisplayName = contract.properties.displayName;
        this.serviceUrl = contract.properties.serviceUrl;
        this.protocols = contract.properties.protocols;
        this.description = contract.properties.description;
        this.path = contract.properties.path;
        this.versionedPath = this.path;
        this.urlSuffix = contract.properties.urlSuffix;
        this.apiVersion = contract.properties.apiVersion;
        this.apiRevision = contract.properties.apiRevision;
        this.subscriptionKeyParameterNames = contract.properties.subscriptionKeyParameterNames;
        this.type = contract.properties.type;

        if (contract.properties.apiVersionSet) {
            const nestedVersionSet = contract.properties.apiVersionSet;
            const versionSet = new VersionSet(contract.properties.apiVersionSetId);
            versionSet.name = nestedVersionSet.name;
            versionSet.description = nestedVersionSet.description;
            versionSet.versionHeaderName = nestedVersionSet.versionHeaderName;
            versionSet.versionQueryName = nestedVersionSet.versionQueryName;
            versionSet.versioningScheme = nestedVersionSet.versioningScheme;
            this.apiVersionSet = versionSet;

            if (nestedVersionSet && this.apiVersion && versionSet.versioningScheme === "Segment") {
                this.versionedPath = `${this.path}/${this.apiVersion}`;
            }

            if (this.apiVersion) {
                this.versionedDisplayName = `${this.displayName} - ${this.apiVersion}`;
            }
        }
    }
}