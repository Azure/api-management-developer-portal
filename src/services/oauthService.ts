import * as ClientOAuth2 from "client-oauth2";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { HttpClient, HttpMethod } from "@paperbits/common/http";
import { Logger } from "@paperbits/common/logging";
import { AuthorizationServer } from "../models/authorizationServer";
import { KnownHttpHeaders } from "../models/knownHttpHeaders";
import { KnownMimeTypes } from "../models/knownMimeTypes";
import { Utils } from "../utils";
import { GrantTypes } from "./../constants";
import { UnauthorizedError } from "./../errors/unauthorizedError";
import { BackendService } from "./backendService";


export class OAuthService {
    constructor(
        private readonly httpClient: HttpClient,
        private readonly backendService: BackendService,
        private readonly settingsProvider: ISettingsProvider,
        private readonly logger: Logger
    ) { }

    public async getAuthServer(openidProviderId: string): Promise<AuthorizationServer> {
        try {
            const authServer = await this.backendService.getOpenIdConnectProvider(openidProviderId);
            return authServer;
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
    public async authenticate(grantType: string, authorizationServer: AuthorizationServer, apiName?: string): Promise<string> {
        const backendUrl = await this.settingsProvider.getSetting<string>("backendUrl") || `https://${location.hostname}`;

        let accessToken;

        switch (grantType) {
            case GrantTypes.implicit:
                this.logger.trackEvent("TestConsoleOAuth", { grantType: GrantTypes.implicit });
                accessToken = await this.authenticateImplicit(backendUrl, authorizationServer);
                break;

            case GrantTypes.authorizationCode:
                this.logger.trackEvent("TestConsoleOAuth", { grantType: GrantTypes.authorizationCode });
                accessToken = await this.authenticateCode(backendUrl, authorizationServer);
                break;

            case GrantTypes.clientCredentials:
                this.logger.trackEvent("TestConsoleOAuth", { grantType: GrantTypes.clientCredentials });
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
    public async authenticateClientCredentials(backendUrl: string, authorizationServer: AuthorizationServer, apiName: string): Promise<string> {
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
            this.logger.trackEvent("TestConsoleOAuthError", { grantType: GrantTypes.clientCredentials, response: response.toText() })

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

    public async authenticatePassword(username: string, password: string, authorizationServer: AuthorizationServer): Promise<string> {
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

        if (response.statusCode == 200) {
            const tokenInfo = response.toObject();
            return `${Utils.toTitleCase(tokenInfo.accessTokenType)} ${tokenInfo.accessToken}`;
        }

        if (response.statusCode === 401) {
            throw new UnauthorizedError("Unable to authenticate. Verify the credentials you entered are correct.");
        }

        throw new Error(`Unable to authenticate. Response: ${response.toText()}`);
    }
}