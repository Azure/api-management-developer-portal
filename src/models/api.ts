import { VersionSet } from "./versionSet";
import { ApiContract, ContactDetails, LicenseDetails, SubscriptionKeyParameterName } from "../contracts/api";
import { Utils } from "../utils";
import { AuthenticationSettings } from "../contracts/authenticationSettings";
import { TypeOfApi } from "../constants";

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

    /**
     * Display name of API that includes version.
     */
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

    /**
     * Subscription key parameter names details.
     */
    public subscriptionKeyParameterNames?: SubscriptionKeyParameterName;

    /**
     * Determines type of API, e.g. "soap".
     */
    public type?: string;
    
    /**
     * Determines type name of API to display in UI, e.g. "Soap".
     */
    public typeName?: string;

    /**
     * Information about associated authorization servers (OAuth 2 or OpenID Connect).
     */
    public authenticationSettings: AuthenticationSettings;

    /**
     * Specifies whether an API or Product subscription is required for accessing the API.
     */
    public subscriptionRequired: boolean;

    /**
     * Contact information.
     */
    public contact?: ContactDetails;

    /**
     * Name of the license and a URL to the license description.
     */
    public license?: LicenseDetails;

    /**
     * Link to the page that describes the terms of service.
     */
    public termsOfServiceUrl?: string;

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
        this.apiVersion = contract.properties.apiVersion;
        this.apiRevision = contract.properties.apiRevision;
        this.subscriptionKeyParameterNames = contract.properties.subscriptionKeyParameterNames;
        this.type = contract.properties.type;
        this.authenticationSettings = contract.properties.authenticationSettings;
        this.subscriptionRequired = contract.properties.subscriptionRequired;
        this.contact = contract.properties.contact;
        this.license = contract.properties.license;
        this.termsOfServiceUrl = contract.properties.termsOfServiceUrl;

        if(contract.properties.type) {
            switch(contract.properties.type) {
                case TypeOfApi.soap:
                    this.typeName = "SOAP";
                    break;
                case TypeOfApi.webSocket:
                    this.typeName = "WebSocket";
                    break;
                case TypeOfApi.graphQL:
                    this.typeName = "GraphQL";
                    break;
                default:
                    this.typeName = "REST";
                    break;
            }
        } else {
            this.typeName = "REST";
        }

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