import * as Constants from "../constants";
import { Utils } from "../utils";
import { Router } from "@paperbits/common/routing";

export class RouteHelper {
    constructor(private readonly router: Router) { }

    public getHashParameter(name: string): string {
        const route = this.router.getCurrentRoute();
        const params = new URLSearchParams(`?${route.hash}`);

        return params.get(name);
    }

    public setHashParameter(name: string, value: string): void {
        const route = this.router.getCurrentRoute();
        const params = new URLSearchParams(route.hash ? `?${route.hash}` : "");

        if(value) {
            params.set(name, value);
        } else {
            params.delete(name);
        }
        
        this.router.navigateTo(`#${params.toString()}`);
    }

    /**
     * Returns ARM resource name of the API specified in hash parameter of the current route, e.g. "httpbin".
     */
    public getApiName(): string {
        return this.getHashParameter("api");
    }

    /**
     * Returns ARM resource name of the API specified in hash parameter of the current route, e.g. "httpbin".
     */
    public getTags(): string {
        return this.getHashParameter("tags");
    }

    /**
     * Returns ARM resource name of the operation specified in hash parameter of the current route, e.g. "status".
     */
    public getOperationName(): string {
        return this.getHashParameter("operation");
    }

    /**
     * Returns ARM resource name of the product specified in hash parameter of the current route, e.g. "unlimited".
     */
    public getProductName(): string {
        return this.getHashParameter("product");
    }

    /**
     * Returns ARM resource name of the graph type specified in hash parameter of the current route for graphQL APIs, e.g. "query".
     */
    public getGraphType(): string {
        return this.getHashParameter("type");
    }

    /**
     * Returns ARM resource name of the graph specified in hash parameter of the current route for graphQL APIs, e.g. "users".
     */
    public getGraphName(): string {
        return this.getHashParameter("graph");
    }

    /**
     * Returns URL of API details page depending on current route.
     * @param apiName ARM resource name of the API.
     * @param detailsPageUrl Relative URL of API details page.
     */
    public getApiReferenceUrl(apiName: string, detailsPageUrl: string = ""): string {
        if (!apiName) {
            throw new Error(`Parameter "apiName" not specified.`);
        }

        let path = "";
        const currentPath = this.router.getPath();

        if (currentPath !== detailsPageUrl) {
            path = detailsPageUrl;
        }

        return `${path}#api=${apiName}`;
    }

    /**
     * Returns URL of operation details page depending on current route.
     * @param apiName ARM resource name of the API.
     * @param operationName ARM resource name of the operation.
     * @param detailsPageUrl Relative URL of operation details page.
     */
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

        return `${path}#api=${apiName}&operation=${operationName}`;
    }

    /**
     * Returns URL of graph details page depending on current route.
     * @param apiName ARM resource name of the API.
     * @param type ARM resource graph type.
     * @param graph ARM resource name of the graph.
     * @param detailsPageUrl Relative URL of operation details page.
     */
     public getGraphReferenceUrl(apiName: string, type: string, graph: string, detailsPageUrl: string = ""): string {

        let path = "";
        const currentPath = this.router.getPath();

        if (currentPath !== detailsPageUrl) {
            path = detailsPageUrl;
        }

        return `${path}#api=${apiName}&type=${type}&graph=${graph}`;
    }

    /**
     * Returns URL of graph details page depending on current route.
     * @param apiName ARM resource name of the API.
     * @param type ARM resource graph type.
     * @param graph ARM resource name of the graph.
     * @param definition Name of the definition.
     */
     public getGraphDefinitionReferenceId(apiName: string, type: string, graph: string, definition: string): string {
        if (!apiName) {
            throw new Error(`Parameter "apiName" not specified.`);
        }

        if (!type) {
            throw new Error(`Parameter "type" not specified.`);
        }

        if (!graph) {
            throw new Error(`Parameter "graphName" not specified.`);
        }

        if (!definition) {
            throw new Error(`Parameter "definition" not specified.`);
        }

        return `api=${apiName}&type=${type}&graph=${graph}&definition=${definition}`;
    }

    /**
     * Returns HTML element identifier for specified type definition.
     * @param apiName ARM resource name of the API.
     * @param operationName ARM resource name of the operation.
     * @param definitionName Name of the definition.
     */
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

    /**
     * Returns HTML element anchor link for specified type definition.
     * @param apiName ARM resource name of the API.
     * @param operationName ARM resource name of the operation.
     * @param definitionName Name of the definition.
     */
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

    /**
     * Returns URL of product details page depending on current route.
     * @param productName ARM resource name of the product.
     * @param detailsPageUrl Relative URL of product details page.
     */
    public getProductReferenceUrl(productName: string, detailsPageUrl: string = ""): string {
        if (!productName) {
            throw new Error(`Parameter "productName" not specified.`);
        }

        let path = "";
        const currentPath = this.router.getPath();

        if (currentPath !== detailsPageUrl) {
            path = detailsPageUrl;
        }

        return `${path}#product=${productName}`;
    }

    /**
     * Returns ID token reference URL.
     * @param provider ID token provider, e.g. "AadB2C".
     * @param idToken ID token.
     */
    public getIdTokenReferenceUrl(provider: string, idToken: string): string {
        if (!provider) {
            throw new Error(`Parameter "provider" not specified.`);
        }

        if (!idToken) {
            throw new Error(`Parameter "idToken" not specified.`);
        }

        let path = "";
        const currentPath = this.router.getPath();

        if (currentPath !== Constants.pageUrlSignUpOAuth) {
            path = Constants.pageUrlSignUpOAuth;
        }

        return `${path}#provider=${provider}&token=${idToken}`;
    }

    /**
     * Returns ID token specified in hash parameter of the current route.
     */
    public getIdToken(): string {
        return this.getHashParameter("token");
    }

    /**
     * Returns ID token provider specified in hash parameter of the current route.
     */
    public getIdTokenProvider(): string {
        return this.getHashParameter("provider");
    }

    public getQueryParameter(name: string): string {
        const queryParams = new URLSearchParams(location.search);

        return queryParams.get(name);
    }
}