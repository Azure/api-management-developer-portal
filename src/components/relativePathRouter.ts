import { EventManager } from "@paperbits/common/events";
import { Router, RouterEvents, Route, RouteGuard } from "@paperbits/common/routing";

export class RelativePathRouter implements Router {
    public currentRoute: Route;
    public notifyListeners: boolean;
    private readonly basePath: string;

    constructor(
        private readonly eventManager: EventManager,
        private readonly routeGuards: RouteGuard[],
    ) {
        this.notifyListeners = true;
        this.basePath = "/_admin";
        this.currentRoute = this.getRouteFromLocation();
    }

    public getRouteFromLocation(): Route {
        const path = "/" + location.pathname.substr(this.basePath.length + 1);
        const hash = location.hash.startsWith("#") ? location.hash.slice(1) : location.hash;
        const url = location.pathname + hash;

        const route: Route = {
            url: url,
            path: path,
            metadata: {},
            hash: hash,
            previous: null
        };

        return route;
    }

    public addRouteChangeListener(eventHandler: (args?: any) => void): void {
        this.eventManager.addEventListener(RouterEvents.onRouteChange, eventHandler);
    }

    public removeRouteChangeListener(eventHandler: (args?: any) => void): void {
        this.eventManager.removeEventListener(RouterEvents.onRouteChange, eventHandler);
    }

    /**
     * Navigates to specified URL.
     * @param url Absolute or relative path, i.e. https://paperbits.io or /about
     * @param title Destination title
     * @param metadata Associated metadata
     */
    public async navigateTo(url: string, title: string = null, metadata: Object = {}): Promise<void> {
        if (!url) {
            return;
        }

        const isFullUrl = url && (url.startsWith("http://") || url.startsWith("https://"));
        const isLocalUrl = url.startsWith(location.origin);

        if (isFullUrl && !isLocalUrl) {
            window.open(url, "_blank"); // navigating external link
            return;
        }

        if (isFullUrl) {
            url = url.substring(location.origin.length);
        }

        if (url.startsWith(this.basePath + "/")) {
            url = url.substring(this.basePath.length);
        }

        const parts = url.split("#");

        const route: Route = {
            url: this.appendBasePath(url),
            path: parts.length > 1 ? parts[0] || location.pathname : parts[0],
            title: title,
            metadata: metadata,
            hash: parts.length > 1 ? parts[1] : "",
            previous: this.currentRoute
        };

        const canActivate = await this.canActivate(route);

        if (canActivate) {
            this.currentRoute = route;

            if (this.notifyListeners) {
                this.eventManager.dispatchEvent(RouterEvents.onRouteChange, route);
            }
        }
    }

    protected async canActivate(route: Route): Promise<boolean> {
        for (const routeGuard of this.routeGuards) {
            try {
                const canActivate = await routeGuard.canActivate(route);

                if (!canActivate) {
                    return false;
                }
            }
            catch (error) {
                throw new Error(`Unable to invoke route a guard: ${error}`);
                return false;
            }
        }

        return true;
    }

    public getCurrentUrl(): string {
        let permalink = this.currentRoute.path;

        const hash = this.getHash();

        if (this.currentRoute.hash) {
            permalink += "#" + hash;
        }

        return permalink;
    }

    public getCurrentUrlMetadata(): Object {
        return this.currentRoute.metadata;
    }

    public getPath(): string {
        return this.currentRoute.path;
    }

    public getHash(): string {
        return this.currentRoute.hash;
    }

    public getCurrentRoute(): Route {
        return this.currentRoute;
    }

    private appendBasePath(url: string): string {
        return url.startsWith("/") ? this.basePath + url : this.basePath + "/" + url;
    }

    public addHistoryUpdateListener(eventHandler: (args?: any) => void): void {
        // Not supported
    }

    public removeHistoryUpdateListener(eventHandler: (args?: any) => void): void {
        // Not supported
    }

    public updateHistory(url: string, title?: string): void {
        // Not supported
    }
}