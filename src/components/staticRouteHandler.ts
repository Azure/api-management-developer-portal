/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file and at https://paperbits.io/license.
 */

import { IRouteHandler, IRouteChecker } from "@paperbits/common/routing";

export class StaticRouteHandler implements IRouteHandler {
    private currentUrl: string;
    private metadata: Object;
    private callbacks: any[];
    protected routeCheckers: IRouteChecker[];

    constructor() {
        this.currentUrl = "/";
        this.navigateTo = this.navigateTo.bind(this);
        this.getCurrentUrl = this.getCurrentUrl.bind(this);
        this.getCurrentUrlMetadata = this.getCurrentUrlMetadata.bind(this);

        this.callbacks = [];
    }

    public addRouteChangeListener(callback: () => void): void {
        // this.callbacks.push(callback);
    }

    public removeRouteChangeListener(callback: () => void): void {
        // this.callbacks.spliceremove(callback);
    }

    public navigateTo(permalink: string): void {
        this.currentUrl = permalink;

        this.callbacks.forEach(callback => {
            callback();
        });
    }

    public getCurrentUrl(): string {
        return this.currentUrl;
    }

    public getPath(): string {
        return this.currentUrl;
    }

    public getHash(): string {
        return "";
    }

    public getCurrentUrlMetadata(): Object {
        return this.metadata;
    }

    public addRouteChecker(routeChecker: IRouteChecker) {
        if (routeChecker) {
            this.routeCheckers.push(routeChecker);
        }
    }

    public removeRouteChecker(routeCheckerName: string) {
        if (routeCheckerName) {
            const removeIndex = this.routeCheckers.findIndex(item => item.name === routeCheckerName);
            if (removeIndex !== -1) {
                this.routeCheckers.splice(removeIndex, 1);
            } else {
                console.log(`routeChecker with name '${routeCheckerName}' was not found`);
            }
        }
    }
}