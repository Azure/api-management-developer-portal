import { AuthorizationServerContract } from "./../contracts/authorizationServer";

export class AuthorizationServer {
    public name: string;
    public displayName: string;
    public description: string;
    public clientId: string;
    public authorizationEndpoint: string;
    public tokenEndpoint: string;
    public grantTypes: string[];
    public scopes: string[];


    constructor(contract?: AuthorizationServerContract) {
        if (!contract) {
            return;
        }

        this.name = contract.name;
        this.displayName = contract.properties.displayName;
        this.description = contract.properties.description;
        this.clientId = contract.properties.clientId;
        this.authorizationEndpoint = contract.properties.authorizationEndpoint;
        this.tokenEndpoint = contract.properties.tokenEndpoint;
        this.scopes = !!contract.properties.defaultScope
            ? contract.properties.defaultScope.split(" ")
            : [];

        if (!contract.properties.grantTypes) {
            return;
        }

        this.grantTypes = contract.properties.grantTypes
            .map(grantType => {
                switch (grantType) {
                    case "authorizationCode":
                        return "authorization_code";
                    case "implicit":
                        return "implicit";
                    case "clientCredentials":
                        return "client_credentials";
                    case "resourceOwnerPassword":
                        return "password";
                    default:
                        console.log(`Unsupported grant type ${grantType}`);
                        return null;
                }
            })
            .filter(grantType => !!grantType);
    }
}