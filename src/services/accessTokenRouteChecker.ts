import { IRouteChecker } from "@paperbits/common/routing";
import { IAuthenticator } from "./IAuthenticator";

export class AccessTokenRouteChecker implements IRouteChecker {
    private publicPaths = ["/", "/signin", "/signup", "/apis", "/products", "/new"];
    private publicPathsPrefixs = ["/apis/", "/products/"];

    public name = "AccessTokenChecker";

    constructor(private readonly authenticator: IAuthenticator) { }

    private isPublicAccess(path: string): boolean {
        // return !!(this.publicPaths.find(p => p === path) || this.publicPathsPrefixs.find(p => path.startsWith(p)));

        return true;
    }

    public checkNavigatePath(path: string, metadata?: Object): Promise<string> {
        if (this.isPublicAccess(path) || path === "/page.html" || this.authenticator.isUserLoggedIn()) {
            return Promise.resolve(path);
        } else {
            location.pathname = "/signin";
            return Promise.resolve("/signin");
        }
    }
}