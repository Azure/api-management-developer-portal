import * as ClientOAuth2 from "client-oauth2";
import { GrantTypes } from "./../constants";
import { MapiClient } from "./mapiClient";
import { AuthorizationServerContract } from "../contracts/authorizationServer";
import { AuthorizationServer } from "../models/authorizationServer";
import { PageContract } from "../contracts/page";

export class OAuthService {
    constructor(private readonly mapiClient: MapiClient) { }

    public async getOAuthServers(): Promise<AuthorizationServer[]> {
        try {
            const pageOfAuthservers = await this.mapiClient.get<PageContract<AuthorizationServerContract>>("/authorizationServers");

            return pageOfAuthservers.value.map(authServer => new AuthorizationServer(authServer));
        }
        catch (error) {
            throw new Error(`Unable to fetch configured authorization servers.`);
        }
    }

    public async authenticate(grantType: string, authorizationServer: AuthorizationServer): Promise<string> {
        let accessToken;

        switch (grantType) {
            case GrantTypes.implicit:
                accessToken = await this.authenticateImplicit(authorizationServer);
                break;

            case GrantTypes.authorizationCode:
                accessToken = await this.authenticateCode(authorizationServer);
                break;

            case GrantTypes.clientCredentials:
                accessToken = await this.authenticateClientCredentials(authorizationServer);
                break;

            default:
                throw new Error(`Unsupported grant type: ${grantType}`);
        }

        return accessToken;
    }

    public authenticateImplicit(authorizationServer: AuthorizationServer): Promise<string> {
        const redirectUri = `https://${location.hostname}/signin-oauth/implicit/callback`;

        const oauthClient = new ClientOAuth2({
            clientId: authorizationServer.clientId,
            accessTokenUri: authorizationServer.tokenEndpoint,
            authorizationUri: authorizationServer.authorizationEndpoint,
            redirectUri: redirectUri,
            scopes: authorizationServer.scopes
        });

        return new Promise((resolve, reject) => {
            window.open(oauthClient.token.getUri(), "_blank", "width=400,height=500");

            const receiveMessage = async (event: MessageEvent) => {
                const tokenHash = event.data["uri"];

                if (!tokenHash) {
                    return;
                }

                const oauthToken = await oauthClient.token.getToken(redirectUri + tokenHash);
                resolve(`${oauthToken.tokenType} ${oauthToken.accessToken}`);
            };

            window.addEventListener("message", receiveMessage, false);
        });
    }

    public async authenticateCode(authorizationServer: AuthorizationServer): Promise<string> {
        const redirectUri = `https://${location.hostname}/signin-oauth/code/callback/${authorizationServer.id}`;

        const oauthClient = new ClientOAuth2({
            clientId: authorizationServer.clientId,
            accessTokenUri: authorizationServer.tokenEndpoint,
            authorizationUri: authorizationServer.authorizationEndpoint,
            redirectUri: redirectUri,
            scopes: authorizationServer.scopes
        });

        return new Promise<string>((resolve, reject) => {
            window.open(oauthClient.code.getUri(), "_blank", "width=400,height=500");

            const receiveMessage = async (event: MessageEvent) => {
                if (!event.data["accessToken"]) {
                    return;
                }

                const accessToken = event.data["accessToken"];
                const accessTokenType = event.data["accessTokenType"];
                resolve(`${accessTokenType} ${accessToken}`);
            };

            window.addEventListener("message", receiveMessage, false);
        });
    }

    public async authenticateClientCredentials(authorizationServer: AuthorizationServer): Promise<string> {
        const uri = `https://${location.hostname}/signin-oauth/credentials/${authorizationServer.id}`;

        return new Promise<string>((resolve, reject) => {
            window.open(uri, "_blank", "width=400,height=500");

            const receiveMessage = async (event: MessageEvent) => {
                if (!event.data["accessToken"]) {
                    return;
                }

                const accessToken = event.data["accessToken"];
                const accessTokenType = event.data["accessTokenType"];
                resolve(`${accessTokenType} ${accessToken}`);
            };

            window.addEventListener("message", receiveMessage, false);
        });
    }
}