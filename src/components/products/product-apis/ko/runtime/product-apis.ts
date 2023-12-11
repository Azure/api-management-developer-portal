import * as ko from "knockout";
import * as Constants from "../../../../../constants";
import template from "./product-apis.html";
import { Component, RuntimeComponent, OnMounted, OnDestroyed, Param } from "@paperbits/common/ko/decorators";
import { Router } from "@paperbits/common/routing";
import { ApiService } from "../../../../../services/apiService";
import { Api } from "../../../../../models/api";
import { SearchQuery } from "../../../../../contracts/searchQuery";
import { RouteHelper } from "../../../../../routing/routeHelper";


@RuntimeComponent({
    selector: "product-apis-runtime"
})
@Component({
    selector: "product-apis-runtime",
    template: template
})
export class ProductApis {
    public readonly apis: ko.ObservableArray<Api>;
    public readonly working: ko.Observable<boolean>;
    public readonly pattern: ko.Observable<string>;
    public readonly pageNumber: ko.Observable<number>;
    public readonly nextPage: ko.Observable<boolean>;

    constructor(
        private readonly apiService: ApiService,
        private readonly router: Router,
        private readonly routeHelper: RouteHelper
    ) {
        this.detailsPageUrl = ko.observable();
        this.detailsPageTarget = ko.observable();
        this.apis = ko.observableArray([]);
        this.working = ko.observable();
        this.pattern = ko.observable();
        this.pageNumber = ko.observable(1);
        this.nextPage = ko.observable();
    }

    @Param()
    public detailsPageUrl: ko.Observable<string>;

    @Param()
    public detailsPageTarget: ko.Observable<string>;

    @OnMounted()
    public async initialize(): Promise<void> {
        await this.searchApis();

        this.router.addRouteChangeListener(this.searchApis);

        this.pattern
            .extend({ rateLimit: { timeout: Constants.defaultInputDelayMs, method: "notifyWhenChangesStop" } })
            .subscribe(this.searchApis);

        this.pageNumber.subscribe(this.loadPageOfApis);
    }

    /**
     * Initiates searching APIs.
     */
    public async searchApis(): Promise<void> {
        this.pageNumber(1);
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

            const pageNumber = this.pageNumber() - 1;

            const query: SearchQuery = {
                pattern: this.pattern(),
                skip: pageNumber * Constants.defaultPageSize,
                take: Constants.defaultPageSize
            };

            const pageOfApis = await this.apiService.getProductApis(`products/${productName}`, query);
            this.apis(pageOfApis.value);
            this.nextPage(!!pageOfApis.nextLink);
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

    @OnDestroyed()
    public dispose(): void {
        this.router.removeRouteChangeListener(this.searchApis);
    }
}