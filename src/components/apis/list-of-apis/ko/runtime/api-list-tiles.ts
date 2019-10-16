import * as ko from "knockout";
import * as Constants from "../../../../../constants";
import template from "./api-list-tiles.html";
import { Component, RuntimeComponent, OnMounted } from "@paperbits/common/ko/decorators";
import { ApiService } from "../../../../../services/apiService";
import { DefaultRouter, Route } from "@paperbits/common/routing";
import { Api } from "../../../../../models/api";
import { TagGroup } from "../../../../../models/tagGroup";
import { SearchQuery } from "../../../../../contracts/searchQuery";


@RuntimeComponent({ selector: "api-list-tiles" })
@Component({
    selector: "api-list-tiles",
    template: template,
    injectable: "apiListTiles"
})
export class ApiListTiles {
    private queryParams: URLSearchParams;
    public readonly apis: ko.ObservableArray<Api>;
    public readonly apiGroups: ko.ObservableArray<TagGroup<Api>>;
    public readonly working: ko.Observable<boolean>;
    public readonly selectedId: ko.Observable<string>;
    public readonly dropDownId: ko.Observable<string>;
    public readonly pattern: ko.Observable<string>;
    public readonly page: ko.Observable<number>;
    public readonly hasPager: ko.Computed<boolean>;
    public readonly hasPrevPage: ko.Observable<boolean>;
    public readonly hasNextPage: ko.Observable<boolean>;
    public readonly groupByTag: ko.Observable<boolean>;

    constructor(
        private readonly apiService: ApiService,
        private readonly router: DefaultRouter,
    ) {
        this.apis = ko.observableArray([]);
        this.working = ko.observable();
        this.selectedId = ko.observable();
        this.dropDownId = ko.observable();
        this.pattern = ko.observable();
        this.page = ko.observable(1);
        this.hasPrevPage = ko.observable();
        this.hasNextPage = ko.observable();
        this.hasPager = ko.computed(() => this.hasPrevPage() || this.hasNextPage());
        this.apiGroups = ko.observableArray();
        this.groupByTag = ko.observable(false);
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        await this.loadApis(this.router.getCurrentRoute());

        this.router.addRouteChangeListener(this.loadApis);

        this.pattern
            .extend({ rateLimit: { timeout: Constants.defaultInputDelayMs, method: "notifyWhenChangesStop" } })
            .subscribe(this.searchApis);

        this.groupByTag
            .subscribe(this.searchApis);
    }

    public async loadApis(route?: Route): Promise<void> {
        const currentHash = route && route.hash;

        if (currentHash) {
            this.queryParams = new URLSearchParams(currentHash);

            if (this.queryParams.has("apiId")) {
                if (this.apis().length === 0) {
                    await this.searchApis();
                }
                this.applySelectedApi();
                return;
            }
        }

        this.queryParams = this.queryParams || new URLSearchParams(); // Params should be take from Route params

        if (this.apis().length > 0) {
            return;
        }
        await this.searchApis();

        this.selectFirst();
    }

    private applySelectedApi(): void {
        const currentId = this.selectedId();
        const selectedId = this.queryParams.get("apiId");
        if (selectedId === currentId) {
            return;
        }
        this.selectedId(selectedId);

        this.queryParams.set("apiId", selectedId);
        this.router.navigateTo("#?" + this.queryParams.toString());
    }

    private selectFirst(): void {
        if (this.queryParams.has("apiId")) {
            return;
        }

        const list = this.apis();

        if (list.length > 0) {
            const selectedId = list[0].name;
            this.queryParams.set("apiId", selectedId);
            this.applySelectedApi();
        }
    }

    public prevPage(): void {
        this.page(this.page() - 1);
        this.searchApis(/*  */);
    }

    public nextPage(): void {
        this.page(this.page() + 1);
        this.searchApis();
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
        try {
            this.working(true);

            const pageNumber = this.page() - 1;

            const query: SearchQuery = {
                pattern: this.pattern(),
                skip: pageNumber * Constants.defaultPageSize,
                take: Constants.defaultPageSize
            };

            let nextLink;

            if (this.groupByTag()) {
                const pageOfTagResources = await this.apiService.getApisByTags(query);
                const apiGroups = pageOfTagResources.value;

                this.apiGroups(apiGroups);

                nextLink = pageOfTagResources.nextLink;
            }
            else {
                const pageOfApis = await this.apiService.getApis(query);
                const apis = pageOfApis ? pageOfApis.value : [];
                this.apis(apis);

                nextLink = pageOfApis.nextLink;
            }

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
}