import { RouteGuard, Route } from "@paperbits/common/routing";
import { IAuthenticator } from "../authentication";

export class AccessTokenRouteGuard implements RouteGuard {
    private publicPaths: string[] = ["/", "/signin", "/signup", "/apis", "/products", "/new"];
    private publicPathsPrefixs: string[] = ["/apis/", "/products/"];

    constructor(private readonly authenticator: IAuthenticator) { }

    private isPublicResource(path: string): boolean {
        // return !!(this.publicPaths.find(p => p === path) || this.publicPathsPrefixs.find(p => path.startsWith(p)));

        return true;
    }

    public async canActivate(route: Route): Promise<boolean> {
        if (this.isPublicResource(route.path) || this.authenticator.isUserSignedIn()) {
            return true;
        } 
        else {
            location.pathname = "/signin";
            return false;
        }
    }
}