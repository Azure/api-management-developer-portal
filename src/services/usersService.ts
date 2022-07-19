import { KnownHttpHeaders } from "./../models/knownHttpHeaders";
import { AccessToken } from "./../authentication/accessToken";
import * as Constants from "./../constants";
import { Router } from "@paperbits/common/routing";
import { HttpHeader, HttpClient, HttpResponse, HttpMethod } from "@paperbits/common/http";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { IAuthenticator } from "../authentication";
import { IApiClient } from "../clients";
import { User } from "../models/user";
import { Utils } from "../utils";
import { Identity } from "../contracts/identity";
import { UserContract } from "../contracts/user";
import { MapiSignupRequest } from "../contracts/signupRequest";
import { MapiError } from "../errors/mapiError";
import { KnownMimeTypes } from "../models/knownMimeTypes";
import { UnauthorizedError } from "../errors/unauthorizedError";

/**
 * A service for management operations with users.
 */
export class UsersService {
    constructor(
        private readonly apiClient: IApiClient,
        private readonly router: Router,
        private readonly authenticator: IAuthenticator,
        private readonly httpClient: HttpClient,
        private readonly settingsProvider: ISettingsProvider
    ) { }

    /**
     * Initiates signing-in with Basic identity provider.
     * @param username {string} User name.
     * @param password {string} Password.
     */
    public async signIn(username: string, password: string): Promise<string> {
        const credentials = `Basic ${btoa(`${username}:${password}`)}`;
        const userId = await this.authenticate(credentials);

        if (userId) {
            return userId;
        }

        this.authenticator.clearAccessToken();
        return undefined;
    }

    /**
     * Authenticates user with specified credentilas and returns user identifier.
     * @param credentials {string} User credentials passed in "Authorization" header.
     * @returns {string} User identifier.
     */
    public async authenticate(credentials: string): Promise<string> {
        const backendUrlBase = await this.settingsProvider.getSetting<string>(Constants.SettingNames.backendUrl)
        let backendUrl = Utils.getUrlWithDeveloperPrefix(backendUrlBase);

        const request = {
            url: `${backendUrl}/identity?api-version=${Constants.managementApiVersion}`,
            method: "GET",
            headers: [
                { name: "Authorization", value: credentials },
                await this.apiClient.getPortalHeader("authenticate")
            ]
        };

        const response = await this.httpClient.send<Identity>(request);

        if (response.statusCode !== 200) {
            const msg = response.statusCode === 400
                ? "This authentication method has been disabled by website administrator."
                : "Please provide a valid email and password.";
            throw new UnauthorizedError(msg);
        }
        const sasTokenHeader = response.headers.find(x => x.name.toLowerCase() === KnownHttpHeaders.OcpApimSasToken.toLowerCase());

        if (sasTokenHeader) {
            const accessToken = AccessToken.parse(sasTokenHeader.value);
            await this.authenticator.setAccessToken(accessToken);
        }

        const identity = response.toObject();
        return identity.id;
    }

    public getTokenFromTicketParams(parameters: URLSearchParams): string {
        const ticket = parameters.get("ticket");
        const ticketId = parameters.get("ticketid");
        const token = `Ticket id="${ticketId}",ticket="${ticket}"`;

        return token;
    }

    public getUserIdFromParams(parameters: URLSearchParams): string {
        const userId = parameters.get("userid");

        return userId ? `/users/${userId}` : undefined;
    }

    public async activateUser(parameters: URLSearchParams): Promise<void> {
        const userId = parameters.get("userid");
        const ticket = parameters.get("ticket");
        const ticketId = parameters.get("ticketid");
        const identity = parameters.get("identity");
        const requestUrl = `/users/${userId}/identities/Basic/${identity}`;
        const token = `Ticket id="${ticketId}",ticket="${ticket}"`;

        const backendUrlBase = await this.settingsProvider.getSetting<string>(Constants.SettingNames.backendUrl)
        let backendUrl = Utils.getUrlWithDeveloperPrefix(backendUrlBase);


        const response = await this.httpClient.send({
            url: `${backendUrl}${requestUrl}&api-version=${Constants.managementApiVersion}`,
            method: "PUT",
            headers: [{ name: "Authorization", value: token }, await this.apiClient.getPortalHeader("activateUser"), Utils.getIsUserResourceHeader()]
        });

        await this.getTokenFromResponse(response);
    }

    public async updatePassword(userId: string, newPassword: string, token: string): Promise<void> {
        const headers = [];

        if (token) {
            headers.push({ name: "Authorization", value: token }, await this.apiClient.getPortalHeader("updatePassword"), Utils.getIsUserResourceHeader());
        }

        const payload = {
            password: newPassword
        };

        await this.apiClient.patch(userId, headers, payload);
    }

    /**
     * Initiates signing-out with Basic identity provider.
     */
    public signOut(): void {
        this.router.navigateTo(`#${Constants.hashSignOut}`);
    }

    /**
     * Returns currently authenticated user ID.
     */
    public async getCurrentUserId(): Promise<string> {
        const token = await this.authenticator.getAccessTokenAsString();

        if (!token) {
            return null;
        }

        try {
            const identity = await this.apiClient.get<Identity>("/identity", [await this.apiClient.getPortalHeader("getCurrentUserId")]);

            if (!identity || !identity.id) {
                return null;
            }

            return `/users/${identity.id}`;
        }
        catch (error) {
            return null;
        }
    }

    /**
     * Checks if current user is authenticated.
     */
    public async isUserSignedIn(): Promise<boolean> {
        return await this.authenticator.isAuthenticated();
    }

    /**
     * Returns currently authenticated user.
     */
    public async getCurrentUser(): Promise<User> {
        try {
            const userId = await this.getCurrentUserId();

            if (!userId) {
                return null;
            }

            const user = await this.apiClient.get<UserContract>(userId, [await this.apiClient.getPortalHeader("getCurrentUser"), Utils.getIsUserResourceHeader()]);

            return new User(user);
        }
        catch (error) {
            this.navigateToSignin();
        }
    }

    /**
     * Updates user profile data.
     * @param userId {string} Unique user identifier.
     * @param updateUserData
     */
    public async updateUser(userId: string, firstName: string, lastName: string): Promise<User> {
        const headers: HttpHeader[] = [{ name: "If-Match", value: "*" }, await this.apiClient.getPortalHeader("updateUser"), Utils.getIsUserResourceHeader()];
        const payload = {
            firstName: firstName,
            lastName: lastName
        };
        await this.apiClient.patch<string>(userId, headers, payload);
        const user = await this.apiClient.get<UserContract>(userId);

        if (user) {
            return new User(user);
        }
        else {
            throw new Error("Could not update user.");
        }
    }

    /**
     * Deletes specified user.
     * @param userId {string} Unique user identifier.
     */
    public async deleteUser(userId: string): Promise<void> {
        try {
            const header: HttpHeader = {
                name: "If-Match",
                value: "*"
            };

            await this.apiClient.delete<string>(userId, [header, await this.apiClient.getPortalHeader("deleteUser"), Utils.getIsUserResourceHeader()]);

            sessionStorage.setItem(Constants.closeAccount, "true");
            this.signOut();
        }
        catch (error) {
            this.navigateToSignin();
        }
    }

    public navigateToProfile(): void {
        this.router.navigateTo(Constants.pageUrlProfile);
    }

    public navigateToSignin(): void {
        this.router.navigateTo(Constants.pageUrlSignIn);
    }

    public navigateToHome(): void {
        this.router.navigateTo(Constants.pageUrlHome);
    }

    /**
     * Check whether current user is authenticated and, if not, redirects to sign-in page.
     */
    public async ensureSignedIn(): Promise<string> {
        const userId = await this.getCurrentUserId();

        if (!userId) {
            this.navigateToSignin();
            return; // intentionally exiting without resolving the promise.
        }

        return userId;
    }

    public async createSignupRequest(signupRequest: MapiSignupRequest): Promise<void> {
        await this.apiClient.post("/users", [await this.apiClient.getPortalHeader("createSignupRequest"), Utils.getIsUserResourceHeader()], signupRequest);
    }

    public async createResetPasswordRequest(email: string): Promise<void> {
        const payload = { to: email };
        await this.apiClient.post(`/confirmations/password`, [await this.apiClient.getPortalHeader("createResetPasswordRequest")], payload);
    }

    public async changePassword(userId: string, newPassword: string): Promise<void> {
        const authToken = await this.authenticator.getAccessTokenAsString();

        if (!authToken) {
            throw Error("Auth token not found");
        }

        const headers = [
            { name: "Authorization", value: authToken },
            { name: "If-Match", value: "*" },
            await this.apiClient.getPortalHeader("changePassword"),
            Utils.getIsUserResourceHeader()
        ];

        const payload = {
            password: newPassword
        };

        await this.apiClient.patch(userId, headers, payload);
    }

    public async createUserWithOAuth(provider: string, idToken: string, firstName: string, lastName: string, email: string): Promise<void> {

        const backendUrlBase = await this.settingsProvider.getSetting<string>(Constants.SettingNames.backendUrl)
        let backendUrl = Utils.getUrlWithDeveloperPrefix(backendUrlBase);

        const jwtToken = Utils.parseJwt(idToken);

        const user: UserContract = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            identities: [{
                id: jwtToken.oid,
                provider: provider
            }]
        };

        const response = await this.httpClient.send({
            url: `${backendUrl}/users?api-version=${Constants.managementApiVersion}`,
            method: HttpMethod.post,
            headers: [
                { name: KnownHttpHeaders.ContentType, value: KnownMimeTypes.Json },
                { name: KnownHttpHeaders.Authorization, value: `${provider} id_token="${idToken}"` },
                await this.apiClient.getPortalHeader("createUserWithOAuth"),
                Utils.getIsUserResourceHeader()
            ],
            body: JSON.stringify(user)
        });

        await this.getTokenFromResponse(response);
    }

    private async getTokenFromResponse(response: HttpResponse<any>): Promise<void> {
        if (!(response.statusCode >= 200 && response.statusCode <= 299)) {
            throw MapiError.fromResponse(response);
        }

        const sasTokenHeader = response.headers.find(x => x.name.toLowerCase() === KnownHttpHeaders.OcpApimSasToken.toLowerCase());

        if (!sasTokenHeader) { // User still not registered with APIM.
            throw new Error("Unable to authenticate.");
            return;
        }

        const accessToken = AccessToken.parse(sasTokenHeader.value);
        await this.authenticator.setAccessToken(accessToken);
    }
}