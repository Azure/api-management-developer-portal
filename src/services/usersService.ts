import * as Constants from "./../constants";
import { IAuthenticator } from "../authentication";
import { MapiClient } from "./mapiClient";
import { Router } from "@paperbits/common/routing";
import { HttpHeader, HttpClient, HttpMethod } from "@paperbits/common/http";
import { User } from "../models/user";
import { Utils } from "../utils";
import { Identity } from "../contracts/identity";
import { UserContract } from "../contracts/user";
import { ISettingsProvider } from "@paperbits/common/configuration";

/**
 * A service for management operations with users.
 */
export class UsersService {
    constructor(
        private readonly httpClient: HttpClient,
        private readonly mapiClient: MapiClient,
        private readonly router: Router,
        private readonly authenticator: IAuthenticator,
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
            this.authenticator.clearAccessToken();
            return undefined;
        }
    }

    public async authenticate(username: string, password: string): Promise<string> {
        const managementApiUrl = await this.settingsProvider.getSetting(Constants.settingNames.managementApiUrl);
        const managementApiVersion = await this.settingsProvider.getSetting(Constants.settingNames.managementApiVersion);
        const credentials = `Basic ${btoa(`${username}:${password}`)}`;

        try {
            const response = await this.httpClient.send<Identity>({
                url: `${managementApiUrl}/identity?api-version=${managementApiVersion}`,
                method: HttpMethod.get,
                headers: [{ name: "Authorization", value: credentials }]
            });

            const identity = response.toObject();
            const accessTokenHeader = response.headers.find(x => x.name.toLowerCase() === "ocp-apim-sas-token");

            if (accessTokenHeader && accessTokenHeader.value) {
                const regex = /token=\"(.*)",refresh/gm;
                const match = regex.exec(accessTokenHeader.value);

                if (!match || match.length < 2) {
                    throw new Error(`Token format is not valid.`);
                }

                const accessToken = match[1];
                this.authenticator.setAccessToken(`SharedAccessSignature ${accessToken}`);
            }

            if (identity && identity.id) {
                return identity.id;
            }
        }
        catch (error) {
            return undefined;
        }
    }

    /**
     * Initiates signing-out with Basic identity provider.
     * @param withRedirect 
     */
    public signOut(withRedirect: boolean = true): void {
        this.authenticator.clearAccessToken();

        if (withRedirect) {
            this.router.navigateTo(Constants.pageUrlSignIn);
        }
    }

    /**
     * Returns currently authenticated user ID.
     */
    public async getCurrentUserId(): Promise<string> {
        try {
            const identity = await this.mapiClient.get<Identity>("/identity");

            if (!identity || !identity.id) {
                return null;
            }

            return `/users/${identity.id}`;

        }
        catch (error) {
            if (error.code === "Unauthorized") {
                return null;
            }

            if (error.code === "ResourceNotFound") {
                return null;
            }
        }
    }

    /**
     * Checks if current user is authenticated.
     */
    public async isUserSignedIn(): Promise<boolean> {
        const userId = await this.getCurrentUserId();

        if (userId) {
            return true;
        }

        return false;
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
        } catch (error) {
            this.router.navigateTo(Constants.pageUrlSignIn);
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

            this.signOut();
        }
        catch (error) {
            this.router.navigateTo(Constants.pageUrlSignIn);
        }
    }

    /**
     * Initiates change email request.
     * TODO: Not implemented.
     * @param user {User} User.
     * @param newEmail {string} Email.
     */
    public async requestChangeEmail(user: User, newEmail: string): Promise<any> {
        try {
            console.log("requestChangeEmail is not implemented");
        }
        catch (error) {
            this.router.navigateTo(Constants.pageUrlSignIn);
        }
    }

    /**
     * Initiates password change request.
     * TODO: Not implemented.
     * @param user 
     * @param newPassword 
     */
    public async requestChangePassword(user: User, newPassword: string): Promise<any> {
        try {
            console.log("requestChangePassword is not implemented");
        }
        catch (error) {
            this.router.navigateTo(Constants.pageUrlSignIn);
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
}