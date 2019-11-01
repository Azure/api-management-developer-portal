import * as Constants from "../constants";
import { Utils } from "../utils";
import { Router } from "@paperbits/common/routing";

export class RouteHelper {
    constructor(private readonly router: Router) { }

    private getHashParameter(name: string): string {
        const route = this.router.getCurrentRoute();
        const params = new URLSearchParams(`?${route.hash}`);

        return params.get(name);
    }

    public getApiName(): string {
        return this.getHashParameter("api");
    }

    public getOperationName(): string {
        return this.getHashParameter("operation");
    }

    public getProductName(): string {
        return this.getHashParameter("product");
    }

    public getApiReferenceUrl(apiName: string, detailsPageUrl: string = ""): string {
        if (!apiName) {
            throw new Error(`Parameter "apiName" not specified.`);
        }

        let path = "";
        const currentPath = this.router.getPath();
        
        if (currentPath !== detailsPageUrl) {
            path = detailsPageUrl;
        }

        if (currentPath.endsWith("/")) {
            path = Utils.ensureTrailingSlash(path);
        }

        return `${path}#api=${apiName}`;
    }

    public getReferenceUrl(apiName: string): string {
        return `${Constants.pageUrlReference}#api=${apiName}`;
    }

    public getOperationReferenceUrl(apiName: string, operationName: string, detailsPageUrl: string = ""): string {
        if (!apiName) {
            throw new Error(`Parameter "apiName" not specified.`);
        }

        if (!operationName) {
            throw new Error(`Parameter "operationName" not specified.`);
        }

        let path = "";
        const currentPath = this.router.getPath();

        if (currentPath !== detailsPageUrl) {
            path = detailsPageUrl;
        }

        if (currentPath.endsWith("/")) {
            path = Utils.ensureTrailingSlash(path);
        }

        return `${path}#api=${apiName}&operation=${operationName}`;
    }

    public getDefinitionReferenceId(apiName: string, operationName: string, definitionName: string): string {
        if (!apiName) {
            throw new Error(`Parameter "apiName" not specified.`);
        }

        if (!operationName) {
            throw new Error(`Parameter "operationName" not specified.`);
        }

        if (!definitionName) {
            throw new Error(`Parameter "definitionName" not specified.`);
        }

        return `api=${apiName}&operation=${operationName}&definition=${definitionName}`;
    }

    public getDefinitionAnchor(apiName: string, operationName: string, definitionName: string): string {
        if (!apiName) {
            throw new Error(`Parameter "apiName" not specified.`);
        }

        if (!operationName) {
            throw new Error(`Parameter "operationName" not specified.`);
        }

        if (!definitionName) {
            throw new Error(`Parameter "definitionName" not specified.`);
        }

        return `#api=${apiName}&operation=${operationName}&definition=${definitionName}`;
    }

    public getProductReferenceUrl(productName: string, detailsPageUrl: string = ""): string {
        if (!productName) {
            throw new Error(`Parameter "productName" not specified.`);
        }

        let path = "";
        const currentPath = this.router.getPath();

        if (currentPath !== detailsPageUrl) {
            path = detailsPageUrl;
        }

        if (currentPath.endsWith("/")) {
            path = Utils.ensureTrailingSlash(path);
        }

        return `${path}#product=${productName}`;
    }
}