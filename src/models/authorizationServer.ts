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
        this.displayName = contract.name;
        this.description = contract.description;
        this.clientId = contract.clientId;
        this.authorizationEndpoint = contract.authorizationEndpoint;
        this.tokenEndpoint = contract.tokenEndpoint;
        this.scopes = !!contract.defaultScope
            ? contract.defaultScope.split(" ")
            : [];

        if (!contract.grantTypes) {
            return;
        }

        this.grantTypes = contract.grantTypes
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