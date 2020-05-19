import * as Constants from "./../constants";
import { Router } from "@paperbits/common/routing";
import { HttpHeader, HttpClient } from "@paperbits/common/http";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { IAuthenticator } from "../authentication";
import { MapiClient } from "./mapiClient";
import { User } from "../models/user";
import { Utils } from "../utils";
import { Identity } from "../contracts/identity";
import { UserContract, UserPropertiesContract, } from "../contracts/user";
import { MapiSignupRequest } from "../contracts/signupRequest";
import { MapiError } from "./mapiError";


/**
 * A service for management operations with users.
 */
export class UsersService {
    constructor(
        private readonly mapiClient: MapiClient,
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
        const userId = await this.authenticate(username, password);

        if (userId) {
            return userId;
        }
        else {
            await this.authenticator.clearAccessToken(true);
            return undefined;
        }
    }

    public async authenticate(username: string, password: string): Promise<string> {
        const credentials = `Basic ${btoa(`${username}:${password}`)}`;

        try {            
            const identity = await this.mapiClient.get<Identity>("/identity", [{ name: "Authorization", value: credentials }]);

            if (identity && identity.id) {
                return identity.id;
            }
        }
        catch (error) {
            return undefined;
        }
    }

    public async activateUser(parameters: URLSearchParams): Promise<void> {
        const userId = parameters.get("userid");
        const ticket = parameters.get("ticket");
        const ticketId = parameters.get("ticketid");
        const identity = parameters.get("identity");
        const requestUrl = `/users/${userId}/identities/Basic/${identity}`;
        const token = `Ticket id="${ticketId}",ticket="${ticket}"`;
        
        await this.mapiClient.put<void>(requestUrl, [{ name: "Authorization", value: token }], {});
    }

    public async updatePassword(userId: string, newPassword: string): Promise<void> {
        await this.mapiClient.patch(userId, undefined, { password: newPassword });
    }

    /**
     * Initiates signing-out with Basic identity provider.
     * @param withRedirect 
     */
    public async signOut(withRedirect: boolean = true): Promise<void> {
        await this.authenticator.clearAccessToken();

        if (withRedirect) {
            this.navigateToSignin();
        }
    }

    /**
     * Returns currently authenticated user ID.
     */
    public async getCurrentUserId(): Promise<string> {
        const token = await this.authenticator.getAccessToken();
        
        if (!token) {
            return null;
        }
        
        try {
            const identity = await this.mapiClient.get<Identity>("/identity");

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

            const user = await this.mapiClient.get<UserContract>(userId);

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
    public async updateUser(userId: string, updateUserData: { firstName: string, lastName: string }): Promise<any> {
        try {
            const header: HttpHeader = {
                name: "If-Match",
                value: "*"
            };
            await this.mapiClient.patch<string>(`${userId}`, [header], updateUserData);
            const user = await this.mapiClient.get<UserContract>(userId);

            if (user) {
                return new User(user);
            }
            else {
                throw new Error("User was not updated with data: " + updateUserData);
                return undefined;
            }
        }
        catch (error) {
            this.navigateToSignin();
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

            const query = Utils.addQueryParameter(userId, "deleteSubscriptions=true&notify=true");

            await this.mapiClient.delete<string>(query, [header]);

            await this.signOut();
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
        await this.mapiClient.post("/users", null, signupRequest);
    }

    public async createResetPasswordRequest(email: string): Promise<void> {
        const payload = { to: email, appType: "developerPortal" };
        await this.mapiClient.post("/confirmations/password", null, payload);
    }

    public async changePassword(userId: string, newPassword: string): Promise<void> {
        const authToken = await this.authenticator.getAccessToken();

        if (!authToken) {
            throw Error("Auth token not found");
        }

        const headers = [
            { name: "Authorization", value: authToken },
            { name: "If-Match", value: "*" }
        ];
        const payload = { password: newPassword };
        await this.mapiClient.patch(userId, headers, payload);
    }

    public async createUserWithOAuth(provider: string, idToken: string, firstName: string, lastName: string, email: string): Promise<void> {
        const managementApiUrl = await this.settingsProvider.getSetting<string>("managementApiUrl");
        const managementApiVersion = await this.settingsProvider.getSetting<string>("managementApiVersion");
        const jwtToken = Utils.parseJwt(idToken);

        const user: UserPropertiesContract = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            identities: [{
                id: jwtToken.oid,
                provider: provider
            }]
        };

        const response = await this.httpClient.send({
            url: `${managementApiUrl}/users?api-version=${managementApiVersion}`,
            method: "POST",
            headers: [
                { name: "Content-Type", value: "application/json" },
                { name: "Authorization", value: `${provider} id_token="${idToken}"` }
            ],
            body: JSON.stringify(user)
        });

        if (!(response.statusCode >= 200 && response.statusCode <= 299)) {
            throw MapiError.fromResponse(response);
        }

        const sasTokenHeader = response.headers.find(x => x.name.toLowerCase() === "ocp-apim-sas-token");

        if (!sasTokenHeader) { // User not registered with APIM.
            throw new Error("Unable to authenticate.");
            return;
        }

        const regex = /token=\"(.*==)\"/gm;
        const matches = regex.exec(sasTokenHeader.value);

        if (!matches || matches.length < 1) {
            throw new Error("Authentication failed. Unable to parse access token.");
        }

        const sasToken = matches[1];
        await this.authenticator.setAccessToken(`SharedAccessSignature ${sasToken}`);

        this.router.navigateTo(Constants.pageUrlHome);
    }
}