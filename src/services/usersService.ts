import { IAuthenticator } from "../authentication/IAuthenticator";
import { MapiClient } from "./mapiClient";
import { Router } from "@paperbits/common/routing";
import { HttpHeader } from "@paperbits/common/http";
import { User } from "../models/user";
import { Utils } from "../utils";
import { SignupRequest } from "../contracts/signupRequest";
import { Identity } from "../contracts/identity";
import { UserContract } from "../contracts/user";

const signinUrl = "/signin";
const profileUrl = "/profile";
const homeUrl = "/";

export class UsersService {
    constructor(
        private readonly smapiClient: MapiClient,
        private readonly router: Router,
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
            this.router.navigateTo(signinUrl);
        }
    }

    public async getCurrentUserId(): Promise<string> {
        try {
            const identity = await this.smapiClient.get<Identity>("/identity");

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

    public async isUserSignedIn(): Promise<boolean> {
        const userId = await this.getCurrentUserId();

        if (userId) {
            return true;
        }

        return false;
    }

    public async getCurrentUser(): Promise<User> {
        try {
            const userId = await this.getCurrentUserId();

            if (!userId) {
                return null;
            }

            const user = await this.smapiClient.get<UserContract>(userId);

            return new User(user);
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
            await this.smapiClient.patch<string>(`${userId}`, [header], updateUserData);
            const user = await this.smapiClient.get<UserContract>(userId);
            
            if (user) {
                return new User(user);
            } else {
                console.error("User was not updated with data: " + updateUserData);
                return undefined;
            }
        } catch (error) {
            this.router.navigateTo(signinUrl);
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
            this.router.navigateTo(signinUrl);
        }
    }

    public async requestChangeEmail(user: User, newEmail: string): Promise<any> {
        try {
            console.log("requestChangeEmail is not implemented");
        } catch (error) {
            this.router.navigateTo(signinUrl);
        }
    }

    public async requestChangePassword(user: User, newPassword: string): Promise<any> {
        try {
            console.log("requestChangePassword is not implemented");
        } catch (error) {
            this.router.navigateTo(signinUrl);
        }
    }

    public navigateToProfile(): void {
        /**
         * TODO: Take user profile URL from settings.
         */
        this.router.navigateTo(profileUrl);
    }

    public navigateToSignin(): void {
        /**
         * TODO: Take sign-in URL from settings.
         */
        this.router.navigateTo(signinUrl);
    }

    public navigateToHome(): void {
        this.router.navigateTo(homeUrl);
    }

    public async ensureSignedIn(): Promise<void> {
        return new Promise<void>((resolve) => {
            const userId = this.getCurrentUserId();

            if (!userId) {
                this.navigateToSignin();
                return; // intentionally exiting without resolving the promise.
            }

            resolve();
        });
    }
}