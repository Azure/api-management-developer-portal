import { AuthorizationServerContract, AuthorizationServerArmContract } from "./../contracts/authorizationServer";

export class AuthorizationServer {
    public name: string;
    public displayName: string;
    public description: string;
    public clientId: string;
    public authorizationEndpoint: string;
    public tokenEndpoint: string;
    public grantTypes: string[];
    public scopes: string[];
}
export class AuthorizationServerDataApi extends AuthorizationServer {
    constructor(contract?: AuthorizationServerContract) {
        super()
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

export class AuthorizationServerArm extends AuthorizationServer {
    constructor(contract?: AuthorizationServerArmContract) {
        super()
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