import * as ClientOAuth2 from "client-oauth2";
import * as Utils from "@paperbits/common";
import { HttpClient } from "@paperbits/common/http";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { GrantTypes } from "./../constants";
import { MapiClient } from "./mapiClient";
import { AuthorizationServerContract } from "../contracts/authorizationServer";
import { AuthorizationServer } from "../models/authorizationServer";
import { PageContract } from "../contracts/page";
import { OpenIdConnectProviderContract } from "../contracts/openIdConnectProvider";
import { OpenIdConnectProvider } from "./../models/openIdConnectProvider";
import { OpenIdConnectMetadata } from "./../contracts/openIdConnectMetadata";


export class OAuthService {
    constructor(
        private readonly mapiClient: MapiClient,
        private readonly httpClient: HttpClient,
        private readonly settingsProvider: ISettingsProvider
    ) { }

    /**
     * Returns configured OAuth 2.0 and OpenID Connect providers.
     */
    public async getOAuthServers(): Promise<AuthorizationServer[]> {
        try {
            const authorizationServers = [];
            const pageOfOAuthServers = await this.mapiClient.get<PageContract<AuthorizationServerContract>>("/authorizationServers", [MapiClient.getPortalHeader("getAuthorizationServers")]);
            const oauthServers = pageOfOAuthServers.value.map(authServer => new AuthorizationServer(authServer));
            authorizationServers.push(...oauthServers);

            const pageOfOicdServers = await this.mapiClient.get<PageContract<OpenIdConnectProviderContract>>("/openidConnectProviders", [MapiClient.getPortalHeader("getOpenidConnectProviders")]);
            const oicdServers = pageOfOicdServers.value.map(authServer => new OpenIdConnectProvider(authServer));

            for (const provider of oicdServers) {
                try {
                    const authServer = await this.discoverOAuthServer(provider.metadataEndpoint);
                    authServer.name = provider.name;
                    authServer.clientId = provider.clientId;
                    authServer.displayName = provider.displayName;
                    authServer.description = provider.description;
                    authorizationServers.push(authServer);
                }
                catch (error) {
                    // Swallow discovery errors until publishing-related notification channel gets implemented.
                }
            }

            return authorizationServers;
        }
        catch (error) {
            throw new Error(`Unable to fetch configured authorization servers. ${error.stack}`);
        }
    }

    /**
     * Returns configured OAuth 2.0 provider.
     */
    public async getOAuthServer(apiId: string): Promise<AuthorizationServer> {
        try {
            const authServer = await this.mapiClient.get<AuthorizationServerContract>(`/apis/${apiId}/authenticationSettings/oAuth2/authorizationServer`, [MapiClient.getPortalHeader("getAuthorizationServers")]);
            return new AuthorizationServer(authServer);
        }
        catch (error) {
            throw new Error(`Unable to fetch configured authorization server. ${error.stack}`);
        }
    }

    /**
     * Returns configured OpenId Connect Provider.
     */
    public async getOpenIdConnectProvider(apiId: string): Promise<AuthorizationServer> {
        try {
            const providerData = await this.mapiClient.get<OpenIdConnectProviderContract>(`/apis/${apiId}/authenticationSettings/openIdConnect/provider`, [MapiClient.getPortalHeader("getOpenidConnectProviders")]);
            if (!providerData) {
                return null;
            }
            
            const provider = new OpenIdConnectProvider(providerData);
            const authServer = await this.discoverOAuthServer(provider.metadataEndpoint);

            if (!authServer) {
                return null;
            }

            authServer.name = provider.name;
            authServer.clientId = provider.clientId;
            authServer.displayName = provider.displayName;
            authServer.description = provider.description;
            return authServer;
        }
        catch (error) {
            throw new Error(`Unable to fetch configured OpenId Connect Provider. ${error.stack}`);
        }
    }

    /**
     * Acquires access token using specified grant flow.
     * @param grantType {string} Requested grant type.
     * @param authorizationServer {AuthorizationServer} Authorization server details.
     */
    public async authenticate(grantType: string, authorizationServer: AuthorizationServer): Promise<string> {
        const backendUrl = await this.settingsProvider.getSetting<string>("backendUrl") || `https://${location.hostname}`;

        let accessToken;

        switch (grantType) {
            case GrantTypes.implicit:
                accessToken = await this.authenticateImplicit(backendUrl, authorizationServer);
                break;

            case GrantTypes.authorizationCode:
                accessToken = await this.authenticateCode(backendUrl, authorizationServer);
                break;

            case GrantTypes.clientCredentials:
                accessToken = await this.authenticateClientCredentials(backendUrl, authorizationServer);
                break;

            default:
                throw new Error(`Unsupported grant type: ${grantType}`);
        }

        return accessToken;
    }

    /**
     * Acquires access token using "implicit" grant flow.
     * @param backendUrl {string} Portal backend URL.
     * @param authorizationServer {AuthorizationServer} Authorization server details.
     */
     public authenticateImplicit(backendUrl: string, authorizationServer: AuthorizationServer): Promise<string> {
        const redirectUri = `${backendUrl}/signin-oauth/implicit/callback`;
        const query = {
            state: Utils.guid()
        };

        if (authorizationServer.scopes.includes("openid")) {
            query["nonce"] = Utils.guid();
            query["response_type"] = "id_token";
        }

        const oauthClient = new ClientOAuth2({
            clientId: authorizationServer.clientId,
            accessTokenUri: authorizationServer.tokenEndpoint,
            authorizationUri: authorizationServer.authorizationEndpoint,
            redirectUri: redirectUri,
            scopes: authorizationServer.scopes,
            query: query
        });

        return new Promise((resolve, reject) => {
            try {
                window.open(oauthClient.token.getUri(), "_blank", "width=400,height=500");

                const receiveMessage = async (event: MessageEvent) => {
                    const tokenHash = event.data["uri"];

                    if (!tokenHash) {
                        return;
                    }

                    const oauthToken = await oauthClient.token.getToken(redirectUri + tokenHash);

                    if (oauthToken.accessToken) {
                        resolve(`${oauthToken.tokenType} ${oauthToken.accessToken}`);
                    }
                    else if (oauthToken.data?.id_token) {
                        resolve(`Bearer ${oauthToken.data.id_token}`);
                    }
                };

                window.addEventListener("message", receiveMessage, false);
            }
            catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Acquires access token using "authorization code" grant flow.
     * @param backendUrl {string} Portal backend URL.
     * @param authorizationServer {AuthorizationServer} Authorization server details.
     */
    public async authenticateCode(backendUrl: string, authorizationServer: AuthorizationServer): Promise<string> {
        const redirectUri = `${backendUrl}/signin-oauth/code/callback/${authorizationServer.name}`;

        const query = {
            state: Utils.guid()
        };

        const oauthClient = new ClientOAuth2({
            clientId: authorizationServer.clientId,
            accessTokenUri: authorizationServer.tokenEndpoint,
            authorizationUri: authorizationServer.authorizationEndpoint,
            redirectUri: redirectUri,
            scopes: authorizationServer.scopes,
            query: query
        });

        return new Promise<string>((resolve, reject) => {
            try {
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
            }
            catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Acquires access token using "client credentials" grant flow.
     * @param backendUrl {string} Portal backend URL.
     * @param authorizationServer {AuthorizationServer} Authorization server details.
     */
    public async authenticateClientCredentials(backendUrl: string, authorizationServer: AuthorizationServer): Promise<string> {
        let uri = `${backendUrl}/signin-oauth/credentials/${authorizationServer.name}`;

        if (authorizationServer.scopes) {
            const scopesString = authorizationServer.scopes.join(" ");
            uri += `?scopes=${encodeURIComponent(scopesString)}`;
        }

        return new Promise<string>((resolve, reject) => {
            try {
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
            }
            catch (error) {
                reject(error);
            }
        });
    }

    public async discoverOAuthServer(metadataEndpoint: string): Promise<AuthorizationServer> {
        const response = await this.httpClient.send<OpenIdConnectMetadata>({ url: metadataEndpoint });
        const metadata = response.toObject();

        const server = new AuthorizationServer();
        server.authorizationEndpoint = metadata.authorization_endpoint;
        server.tokenEndpoint = metadata.token_endpoint;
        server.scopes = ["openid"];

        // Leaving only "implicit" grant flow until backend gets deployed.
        const supportedGrantTypes = [GrantTypes.implicit.toString(), GrantTypes.authorizationCode.toString()];

        server.grantTypes = metadata.grant_types_supported
            ? metadata.grant_types_supported.filter(grantType => supportedGrantTypes.includes(grantType))
            : [GrantTypes.implicit, GrantTypes.authorizationCode];

        return server;
    }
}