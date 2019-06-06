import { IAuthenticator } from "../authentication/IAuthenticator";
import { MapiClient } from "./mapiClient";
import { RouteHandler } from "@paperbits/common/routing";
import { HttpHeader } from "@paperbits/common/http";
import { User } from "../models/user";
import { Utils } from "../utils";
import { SignupRequest } from "../contracts/signupRequest";

export class UsersService {
    constructor(
        private readonly smapiClient: MapiClient,
        private readonly routeHandler: RouteHandler,
        private readonly authenticator: IAuthenticator
    ) { }

    public async signIn(username: string, password: string): Promise<string> {
        const authString = `Basic ${btoa(`${username}:${password}`)}`;

        const responseData = await this.smapiClient.get<{ id: string }>("identity", [{ name: "Authorization", value: authString }]);
        if (responseData && responseData.id) {
            this.authenticator.setUser(responseData.id);
            return responseData.id;
        } else {
            this.authenticator.clearAccessToken();
            return undefined;
        }
    }

    public async createSignupRequest(signupRequest: SignupRequest): Promise<void> {
        await this.smapiClient.post("/users", null, signupRequest);
    }

    public signOut(withRedirect: boolean = true): void {
        this.authenticator.clearAccessToken();

        if (withRedirect) {
            this.routeHandler.navigateTo("/signin");
        }
    }

    public getCurrentUserId(): string {
        const currentUserId = this.authenticator.getUser();

        if (!currentUserId) {
            return null;
        }

        return (currentUserId.indexOf("/users") === 0) ? currentUserId : `/users/${currentUserId}`;
    }

    public isCurrentUserAdmin(): boolean {
        const currentUserId = this.getCurrentUserId();

        if (!currentUserId) {
            return false;
        }

        return currentUserId === "/users/1";
    }

    public isUserSignedIn(): boolean {
        return !!this.authenticator.getAccessToken() && !!this.authenticator.getUser();
    }

    public async getCurrentUser(): Promise<User> {
        try {
            const userId = this.getCurrentUserId();

            if (!userId) {
                return null;
            }

            const user = await this.smapiClient.get<User>(userId);

            return user;
        }
        catch (error) {
            this.navigateToSignin();
        }
    }

    public async updateUser(userId: string, updateUserData: { firstName: string, lastName: string }): Promise<any> {
        try {
            const header: HttpHeader = {
                name: "If-Match",
                value: "*"
            };
            const user = await this.smapiClient.patch<string>(`${userId}`, [header], updateUserData);
            if (user) {
                return user;
            } else {
                console.error("User was not updated with data: " + updateUserData);
                return undefined;
            }
        } catch (error) {
            this.routeHandler.navigateTo("/signin");
        }
    }

    public async deleteUser(userId: string): Promise<void> {
        try {
            const header: HttpHeader = {
                name: "If-Match",
                value: "*"
            };

            const query = Utils.addQueryParameter(userId, "deleteSubscriptions=true&notify=true");
            await this.smapiClient.delete<string>(query, [header]);
            this.signOut();
            console.log("User was deleted");
        } catch (error) {
            this.routeHandler.navigateTo("/signin");
        }
    }

    public async requestChangeEmail(user: User, newEmail: string): Promise<any> {
        try {
            console.log("requestChangeEmail is not implemented");
        } catch (error) {
            this.routeHandler.navigateTo("/signin");
        }
    }

    public async requestChangePassword(user: User, newPassword: string): Promise<any> {
        try {
            console.log("requestChangePassword is not implemented");
        } catch (error) {
            this.routeHandler.navigateTo("/signin");
        }
    }

    public navigateToProfile(): void {
        /**
         * TODO: Take user profile URL from settings.
         */
        location.assign("/profile");
    }

    public navigateToSignin(): void {
        /**
         * TODO: Take sign-in URL from settings.
         */
        location.assign("/signin");
    }

    public navigateToHome(): void {
        location.assign("/");
    }

    public async ensureSignedIn(): Promise<void> {
        const userId = this.getCurrentUserId();

        if (!userId) {
            this.navigateToSignin();
        }
    }
}