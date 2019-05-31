import { IRouteGuard } from "@paperbits/common/routing";
import { IAuthenticator } from "../authentication";

export class AccessTokenRouteGuard implements IRouteGuard {
    private publicPaths: string[] = ["/", "/signin", "/signup", "/apis", "/products", "/new"];
    private publicPathsPrefixs: string[] = ["/apis/", "/products/"];

    constructor(private readonly authenticator: IAuthenticator) { }

    private isPublicAccess(path: string): boolean {
        // return !!(this.publicPaths.find(p => p === path) || this.publicPathsPrefixs.find(p => path.startsWith(p)));

        return true;
    }

    public async canActivate(path: string, metadata?: object): Promise<boolean> {
        if (this.isPublicAccess(path) || this.authenticator.isUserLoggedIn()) {
            return true;
        } 
        else {
            location.pathname = "/signin";
            return false;
        }
    }
}