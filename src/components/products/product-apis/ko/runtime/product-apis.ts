import * as ko from "knockout";
import template from "./product-apis.html";
import { Component, RuntimeComponent, OnMounted, OnDestroyed } from "@paperbits/common/ko/decorators";
import { Router } from "@paperbits/common/routing";
import { ApiService } from "../../../../../services/apiService";
import { Api } from "../../../../../models/api";
import * as Constants from "../../../../../constants";
import { SearchQuery } from "../../../../../contracts/searchQuery";


@RuntimeComponent({ selector: "product-apis" })
@Component({
    selector: "product-apis",
    template: template,
    injectable: "productApis"
})
export class ProductApis {
    public readonly apis: ko.ObservableArray<Api>;
    public readonly working: ko.Observable<boolean>;
    public readonly pattern: ko.Observable<string>;
    public readonly page: ko.Observable<number>;
    public readonly hasPager: ko.Computed<boolean>;
    public readonly hasPrevPage: ko.Observable<boolean>;
    public readonly hasNextPage: ko.Observable<boolean>;

    constructor(
        private readonly apiService: ApiService,
        private readonly router: Router
    ) {
        this.apis = ko.observableArray([]);
        this.working = ko.observable();
        this.pattern = ko.observable();
        this.page = ko.observable(1);
        this.hasPrevPage = ko.observable();
        this.hasNextPage = ko.observable();
        this.hasPager = ko.computed(() => this.hasPrevPage() || this.hasNextPage());
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        await this.searchApis();
        
        this.router.addRouteChangeListener(this.searchApis);

        this.pattern
            .extend({ rateLimit: { timeout: Constants.defaultInputDelayMs, method: "notifyWhenChangesStop" } })
            .subscribe(this.searchApis);
    }

    private getProductId(): string {
        const route = this.router.getCurrentRoute();
        const queryParams = new URLSearchParams(route.hash || (route.url.indexOf("?") !== -1 ? route.url.split("?").pop() : ""));
        const productId = queryParams.get("productId");

        return productId ? `/products/${productId}` : undefined;
    }

    /**
     * Initiates searching APIs.
     */
    public async searchApis(): Promise<void> {
        this.page(1);
        this.loadPageOfApis();
    }

    /**
     * Loads page of APIs.
     */
    public async loadPageOfApis(): Promise<void> {
        const productId = this.getProductId();

        if (!productId) {
            return;
        }

        try {
            this.working(true);

            const pageNumber = this.page() - 1;

            const query: SearchQuery = {
                pattern: this.pattern(),
                skip: pageNumber * Constants.defaultPageSize,
                take: Constants.defaultPageSize
            };

            const pageOfApis = await this.apiService.getProductApis(productId, query);
            this.apis(pageOfApis.value);

            const nextLink = pageOfApis.nextLink;
            
            this.hasPrevPage(pageNumber > 0);
            this.hasNextPage(!!nextLink);
        }
        catch (error) {
            console.error(`Unable to load APIs. ${error}`);
        }
        finally {
            this.working(false);
        }
    }

    public getReferenceUrl(api: Api): string {
        return `${Constants.apiReferencePageUrl}#?apiId=${api.name}`;
    }
    
    public prevPage(): void {
        this.page(this.page() - 1);
        this.loadPageOfApis();
    }

    public nextPage(): void {
        this.page(this.page() + 1);
        this.loadPageOfApis();
    }

    @OnDestroyed()
    public dispose(): void {
        this.router.removeRouteChangeListener(this.searchApis);
    }
}