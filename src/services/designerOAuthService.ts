import * as ClientOAuth2 from "client-oauth2";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { HttpClient, HttpMethod } from "@paperbits/common/http";
import { AuthorizationServerArmContract } from "../contracts/authorizationServer";
import { OpenIdConnectProviderArmContract } from "../contracts/openIdConnectProvider";
import { AuthorizationServerArm } from "../models/authorizationServer";
import { Utils } from "../utils";
import { GrantTypes } from "./../constants";
import { OpenIdConnectMetadata } from "./../contracts/openIdConnectMetadata";
import { UnauthorizedError } from "./../errors/unauthorizedError";
import { OpenIdConnectProviderArm } from "./../models/openIdConnectProvider";
import { MapiClient } from "./mapiClient";
import { KnownHttpHeaders } from "../models/knownHttpHeaders";
import { KnownMimeTypes } from "../models/knownMimeTypes";

export class DesignerOAuthService {
    private environmentPromise: Promise<string>;

    constructor(
        private readonly mapiClient: MapiClient,
        private readonly httpClient: HttpClient,
        private readonly settingsProvider: ISettingsProvider
    ) { }

    private async getEnvironment(): Promise<string> {
        if (!this.environmentPromise) {
            this.environmentPromise = this.settingsProvider.getSetting<string>("environment");
        }
        return this.environmentPromise;
    }

    /**
     * Returns configured OAuth 2.0 and OpenID Connect providers.
     */
    public async getOAuthServers(): Promise<AuthorizationServerArm[]> {
        const loadedServers = await this.settingsProvider.getSetting<AuthorizationServerArm[]>("authServers");
        return loadedServers || [];
    }

    public async getAuthServer(authorizationServerId: string, openidProviderId: string): Promise<AuthorizationServerArm> {
        const env = await this.getEnvironment();
        if (env !== "development") {
            const servers = await this.getOAuthServers();
            let server = undefined;
            if (servers) {
                server = servers.find(s => s.name === (authorizationServerId || openidProviderId));
            }
            return server;
        }

        try {
            let authorizationServer: AuthorizationServerArm;
            if (authorizationServerId) {
                const authServer = await this.mapiClient.get<AuthorizationServerArmContract>(`/authorizationServers/${authorizationServerId}`, [await this.mapiClient.getPortalHeader("getAuthorizationServer")]);
                authorizationServer = new AuthorizationServerArm(authServer);
                return authorizationServer;
            }
            if (openidProviderId) {
                const authServer = await this.mapiClient.get<OpenIdConnectProviderArmContract>(`/openidConnectProviders/${openidProviderId}`, [await this.mapiClient.getPortalHeader("getOpenidConnectProvider")]);
                const provider = new OpenIdConnectProviderArm(authServer);
                try {
                    const openIdServer = await this.discoverOAuthServer(provider.metadataEndpoint);
                    openIdServer.name = provider.name;
                    openIdServer.clientId = provider.clientId;
                    openIdServer.displayName = provider.displayName;
                    openIdServer.description = provider.description;
                    return openIdServer;
                }
                catch (error) {
                    // Swallow discovery errors until publishing-related notification channel gets implemented.
                }
            }

            return undefined;
        }
        catch (error) {
            throw new Error(`Unable to fetch configured authorization servers. ${error.stack}`);
        }
    }

    public async loadAllServers(): Promise<AuthorizationServerArm[]> {
        try {
            const authorizationServers = [];
            const allOAuthServers = await this.mapiClient.getAll<AuthorizationServerArmContract>("/authorizationServers", [await this.mapiClient.getPortalHeader("getAuthorizationServers")]);
            const oauthServers = allOAuthServers.map(authServer => new AuthorizationServerArm(authServer));
            authorizationServers.push(...oauthServers);

            const allOicdServers = await this.mapiClient.getAll<OpenIdConnectProviderArmContract>("/openidConnectProviders", [await this.mapiClient.getPortalHeader("getOpenidConnectProviders")]);
            const oicdServers = allOicdServers.map(authServer => new OpenIdConnectProviderArm(authServer));

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
     * Acquires access token using specified grant flow.
     * @param grantType {string} Requested grant type.
     * @param authorizationServer {AuthorizationServer} Authorization server details.
     */
    public async authenticate(grantType: string, authorizationServer: AuthorizationServerArm, apiName?: string): Promise<string> {
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
                accessToken = await this.authenticateClientCredentials(backendUrl, authorizationServer, apiName);
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
    public authenticateImplicit(backendUrl: string, authorizationServer: AuthorizationServerArm): Promise<string> {
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

                    const tokenInfo = await oauthClient.token.getToken(redirectUri + tokenHash);

                    if (tokenInfo.accessToken) {
                        resolve(`${Utils.toTitleCase(tokenInfo.tokenType)} ${tokenInfo.accessToken}`);
                    }
                    else if (tokenInfo.data?.id_token) {
                        resolve(`Bearer ${tokenInfo.data.id_token}`);
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
    public async authenticateCode(backendUrl: string, authorizationServer: AuthorizationServerArm): Promise<string> {
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
                    resolve(`${Utils.toTitleCase(accessTokenType)} ${accessToken}`);
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
    public async authenticateClientCredentials(backendUrl: string, authorizationServer: AuthorizationServerArm, apiName: string): Promise<string> {
        const response = await this.httpClient.send<any>({
            method: HttpMethod.post,
            url: `${backendUrl}/signin-oauth/credentials/${apiName}`,
            headers: [{ name: KnownHttpHeaders.ContentType, value: KnownMimeTypes.Json }]
        });

        if (response.statusCode === 200) {
            const tokenInfo = response.toObject();
            return `${Utils.toTitleCase(tokenInfo.accessTokenType)} ${tokenInfo.accessToken}`;
        }

        if (response.statusCode === 400) {
            const error = response.toObject();

            if (error.message !== "Authorization server configuration not found.") { // message from legacy flow
                alert(error.message);
                return null;
            }
        }

        // Run legacy window-based flow
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
                    resolve(`${Utils.toTitleCase(accessTokenType)} ${accessToken}`);
                };

                window.addEventListener("message", receiveMessage, false);
            }
            catch (error) {
                reject(error);
            }
        });
    }

    public async authenticatePassword(username: string, password: string, authorizationServer: AuthorizationServerArm): Promise<string> {
        const backendUrl = await this.settingsProvider.getSetting<string>("backendUrl") || `https://${location.hostname}`;
        let uri = `${backendUrl}/signin-oauth/password/${authorizationServer.name}`;

        if (authorizationServer.scopes) {
            const scopesString = authorizationServer.scopes.join(" ");
            uri += `?scopes=${encodeURIComponent(scopesString)}`;
        }

        const response = await this.httpClient.send<any>({
            method: HttpMethod.post,
            url: uri,
            body: JSON.stringify({ username: username, password: password })
        });

        if (response.statusCode === 401) {
            throw new UnauthorizedError("Unable to authenticate. Verify the credentials you entered are correct.");
        }

        const tokenInfo = response.toObject();

        return `${Utils.toTitleCase(tokenInfo.accessTokenType)} ${tokenInfo.accessToken}`;
    }

    public async discoverOAuthServer(metadataEndpoint: string): Promise<AuthorizationServerArm> {
        const response = await this.httpClient.send<OpenIdConnectMetadata>({ url: metadataEndpoint });
        const metadata = response.toObject();

        const server = new AuthorizationServerArm();
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