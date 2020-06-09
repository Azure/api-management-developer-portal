import { UserService, BuiltInRoles } from "@paperbits/common/user";
import { IAuthenticator } from "../authentication";

export class StaticUserService implements UserService {
    constructor(private readonly authenticator: IAuthenticator) { }

    public async getUserName(): Promise<string> {
        return "";
    }

    public async getUserPhotoUrl(): Promise<string> {
        return "";
    }

    /**
     * Returns current user's role keys.
     */
    public async getUserRoles(): Promise<string[]> {
        const authenticated = await this.authenticator.isAuthenticated();

        if (authenticated) {
            return [BuiltInRoles.authenticated.key];
        }
        else {
            return [BuiltInRoles.anonymous.key];
        }
    }

    /**
     * Assigns roles to current user.
     * @param roles 
     */
    public async setUserRoles(roles: string[]): Promise<void> {
        throw new Error("Not implemented.");
    }
}