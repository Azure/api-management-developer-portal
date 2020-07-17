import { OpenIdConnectMetadata } from "./../contracts/openIdConnectMetadata";

import * as ClientOAuth2 from "client-oauth2";
import { HttpClient } from "@paperbits/common/http";
import { GrantTypes } from "./../constants";
import { MapiClient } from "./mapiClient";
import { AuthorizationServerContract } from "../contracts/authorizationServer";
import { AuthorizationServer } from "../models/authorizationServer";
import { PageContract } from "../contracts/page";
import { OpenIdConnectProviderContract } from "../contracts/openIdConnectProvider";
import { OpenIdConnectProvider } from "./../models/openIdConnectProvider";

export class OAuthService {
    constructor(
        private readonly mapiClient: MapiClient,
        private readonly httpClient: HttpClient
    ) { }

    public async getOpenIdConnectProviders(): Promise<OpenIdConnectProvider[]> {
        try {
            const pageOfAuthservers = await this.mapiClient.get<PageContract<OpenIdConnectProviderContract>>("/openidConnectProviders");
            return pageOfAuthservers.value.map(authServer => new OpenIdConnectProvider(authServer));
        }
        catch (error) {
            throw new Error(`Unable to fetch configured authorization servers.`);
        }
    }

    public async getOAuthServers(): Promise<AuthorizationServer[]> {
        try {
            const authorizationServers = [];
            const pageOfOAuthServers = await this.mapiClient.get<PageContract<AuthorizationServerContract>>("/authorizationServers");
            const oauthServers = pageOfOAuthServers.value.map(authServer => new AuthorizationServer(authServer));
            authorizationServers.push(...oauthServers);

            const pageOfOicdServers = await this.mapiClient.get<PageContract<OpenIdConnectProviderContract>>("/openidConnectProviders");
            const oicdServers = pageOfOicdServers.value.map(authServer => new OpenIdConnectProvider(authServer));

            for (const provider of oicdServers) {
                const authServer = await this.discoverOAuthServer(provider.metadataEndpoint);
                authServer.name = provider.name;
                authServer.clientId = provider.clientId;
                authServer.displayName = provider.displayName;
                authServer.description = provider.description;
                authorizationServers.push(authServer);
            }

            return authorizationServers;
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
        const redirectUri = `https://${location.hostname}/signin-oauth/code/callback/${authorizationServer.name}`;

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
        const uri = `https://${location.hostname}/signin-oauth/credentials/${authorizationServer.name}`;

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

    public async discoverOAuthServer(metadataEndpoint: string): Promise<AuthorizationServer> {
        const response = await this.httpClient.send<OpenIdConnectMetadata>({ url: metadataEndpoint });
        const metadata = response.toObject();

        const server = new AuthorizationServer();
        server.authorizationEndpoint = metadata.authorization_endpoint;
        server.tokenEndpoint = metadata.token_endpoint;
        server.scopes = metadata.scopes_supported || ["openid"];

        // Leaving only "implicit" grant flow until backend gets deployed.
        const supportedGrantTypes = [GrantTypes.implicit.toString()];

        server.grantTypes = metadata.grant_types_supported
            ? metadata.grant_types_supported.filter(grantType => supportedGrantTypes.includes(grantType))
            : [GrantTypes.implicit];

        return server;
    }
}