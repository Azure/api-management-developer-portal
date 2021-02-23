import * as ko from "knockout";
import * as Constants from "../../../../../constants";
import template from "./product-apis-tiles.html";
import { Component, RuntimeComponent, OnMounted, OnDestroyed, Param } from "@paperbits/common/ko/decorators";
import { Router } from "@paperbits/common/routing";
import { ApiService } from "../../../../../services/apiService";
import { Api } from "../../../../../models/api";
import { SearchQuery } from "../../../../../contracts/searchQuery";
import { RouteHelper } from "../../../../../routing/routeHelper";


@RuntimeComponent({
    selector: "product-apis-tiles-runtime"
})
@Component({
    selector: "product-apis-tiles-runtime",
    template: template
})
export class ProductApisTiles {
    public readonly apis: ko.ObservableArray<Api>;
    public readonly working: ko.Observable<boolean>;
    public readonly pattern: ko.Observable<string>;
    public readonly page: ko.Observable<number>;
    public readonly hasPager: ko.Computed<boolean>;
    public readonly hasPrevPage: ko.Observable<boolean>;
    public readonly hasNextPage: ko.Observable<boolean>;

    constructor(
        private readonly apiService: ApiService,
        private readonly router: Router,
        private readonly routeHelper: RouteHelper
    ) {
        this.detailsPageUrl = ko.observable();
        this.apis = ko.observableArray([]);
        this.working = ko.observable();
        this.pattern = ko.observable();
        this.page = ko.observable(1);
        this.hasPrevPage = ko.observable();
        this.hasNextPage = ko.observable();
        this.hasPager = ko.computed(() => this.hasPrevPage() || this.hasNextPage());
    }

    @Param()
    public detailsPageUrl: ko.Observable<string>;

    @OnMounted()
    public async initialize(): Promise<void> {
        await this.searchApis();

        this.router.addRouteChangeListener(this.searchApis);

        this.pattern
            .extend({ rateLimit: { timeout: Constants.defaultInputDelayMs, method: "notifyWhenChangesStop" } })
            .subscribe(this.searchApis);
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
        const productName = this.routeHelper.getProductName();

        if (!productName) {
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

            const pageOfApis = await this.apiService.getProductApis(`products/${productName}`, query);
            this.apis(pageOfApis.value);

            const nextLink = pageOfApis.nextLink;

            this.hasPrevPage(pageNumber > 0);
            this.hasNextPage(!!nextLink);
        }
        catch (error) {
            throw new Error(`Unable to load APIs. Error: ${error.message}`);
        }
        finally {
            this.working(false);
        }
    }

    public getReferenceUrl(api: Api): string {
        return this.routeHelper.getApiReferenceUrl(api.name, this.detailsPageUrl());
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