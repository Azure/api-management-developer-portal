import { AuthorizationServerForClient } from "./../contracts/authorizationServer";

export class AuthorizationServer {
    public name: string;
    public displayName: string;
    public description: string;
    public clientId: string;
    public authorizationEndpoint: string;
    public tokenEndpoint: string;
    public grantTypes: string[];
    public scopes: string[];

    constructor(contract?: AuthorizationServerForClient) {
        if (!contract) {
            return;
        }

        this.name = contract.name;
        this.displayName = contract.name;
        this.description = contract.description;
        this.clientId = contract.clientId;
        this.authorizationEndpoint = contract.authorizationEndpoint;
        this.tokenEndpoint = contract.tokenEndpoint;
        this.scopes = contract.defaultScope?.split(" ") || [];

        if (!contract.grantTypes) {
            return;
        }

        this.grantTypes = this.convertGrantTypes(contract.grantTypes);
    }

    private convertGrantTypes(grantTypes: string[]): string[] {
        return grantTypes.reduce((result, item) => {
            let convertedResult: string;
            switch (item) {
                case "authorizationCode":
                    convertedResult = "authorization_code";
                    break;
                case "implicit":
                    convertedResult = "implicit";
                    break;
                case "clientCredentials":
                    convertedResult = "client_credentials";
                    break;
                case "resourceOwnerPassword":
                    convertedResult = "password";
                    break;
                default:
                    throw new Error(`Unsupported grant type "${item}".`);
            }
            if (convertedResult) {
                result.push(convertedResult);
            }
            return result;
        }, []);
    }
}