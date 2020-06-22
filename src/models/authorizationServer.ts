import { GrantTypes } from "./../constants";
import { AuthorizationServerContract } from "./../contracts/authorizationServer";

export class AuthorizationServer {
    public readonly id: string;
    public readonly displayName: string;
    public readonly clientId: string;
    public readonly authorizationEndpoint: string;
    public readonly tokenEndpoint: string;
    public readonly grantTypes: string[];
    public scopes: string[];


    constructor(contract: AuthorizationServerContract) {
        this.id = contract.name;
        this.displayName = contract.properties.displayName;
        this.clientId = contract.properties.clientId;
        this.authorizationEndpoint = contract.properties.authorizationEndpoint;
        this.tokenEndpoint = contract.properties.tokenEndpoint;
        this.scopes = !!contract.properties.defaultScope
            ? contract.properties.defaultScope.split(" ")
            : [];

        this.grantTypes = contract.properties.grantTypes;
    }
}