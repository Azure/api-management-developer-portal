import * as ko from "knockout";
import * as Constants from "../../../../../constants";
import template from "./api-list-dropdown.html";
import { Component, RuntimeComponent, OnMounted, Param, OnDestroyed } from "@paperbits/common/ko/decorators";
import { Router } from "@paperbits/common/routing";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { Api } from "../../../../../models/api";
import { ApiService } from "../../../../../services/apiService";
import { TagGroup } from "../../../../../models/tagGroup";
import { SearchQuery } from "../../../../../contracts/searchQuery";
import { Utils } from "../../../../../utils";
import { Tag } from "../../../../../models/tag";


@RuntimeComponent({
    selector: "api-list-dropdown"
})
@Component({
    selector: "api-list-dropdown",
    template: template
})
export class ApiListDropdown {
    public readonly apiGroups: ko.ObservableArray<TagGroup<Api>>;
    public readonly selectedApi: ko.Observable<Api>;
    public readonly selectedApiName: ko.Observable<string>;
    public readonly working: ko.Observable<boolean>;
    public readonly pattern: ko.Observable<string>;
    public readonly tags: ko.Observable<Tag[]>;
    public readonly page: ko.Observable<number>;
    public readonly hasPager: ko.Computed<boolean>;
    public readonly hasPrevPage: ko.Observable<boolean>;
    public readonly hasNextPage: ko.Observable<boolean>;
    public readonly selection: ko.Computed<string>;

    constructor(
        private readonly apiService: ApiService,
        private readonly router: Router,
        private readonly routeHelper: RouteHelper
    ) {
        this.detailsPageUrl = ko.observable();
        this.allowSelection = ko.observable(false);
        this.working = ko.observable();
        this.selectedApi = ko.observable();
        this.selectedApiName = ko.observable();
        this.pattern = ko.observable();
        this.tags = ko.observable([]);
        this.page = ko.observable(1);
        this.hasPrevPage = ko.observable();
        this.hasNextPage = ko.observable();
        this.hasPager = ko.computed(() => this.hasPrevPage() || this.hasNextPage());
        this.apiGroups = ko.observableArray();
        this.selection = ko.computed(() => {
            const api = ko.unwrap(this.selectedApi);
            return api ? api.versionedDisplayName : "Select API";
        });
    }

    @Param()
    public allowSelection: ko.Observable<boolean>;

    @Param()
    public detailsPageUrl: ko.Observable<string>;

    @OnMounted()
    public async initialize(): Promise<void> {
        await this.resetSearch();
        await this.checkSelection();

        this.pattern
            .extend({ rateLimit: { timeout: Constants.defaultInputDelayMs, method: "notifyWhenChangesStop" } })
            .subscribe(this.resetSearch);

        this.tags
            .subscribe(this.resetSearch);

        this.router.addRouteChangeListener(this.onRouteChange);
    }

    /**
     * Initiates searching APIs.
     */
    public async resetSearch(): Promise<void> {
        this.page(1);
        this.loadPageOfApis();
    }

    private async onRouteChange(): Promise<void> {
        const apiName = this.routeHelper.getApiName();

        if (apiName === this.selectedApiName()) {
            return;
        }

        await this.checkSelection();
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
                tags: this.tags(),
                skip: pageNumber * Constants.defaultPageSize,
                take: Constants.defaultPageSize
            };

            const pageOfTagResources = await this.apiService.getApisByTags(query);
            const apiGroups = pageOfTagResources.value;
            this.apiGroups(apiGroups);

            const nextLink = pageOfTagResources.nextLink;

            this.hasPrevPage(pageNumber > 0);
            this.hasNextPage(!!nextLink);
        }
        catch (error) {
            throw new Error(`Unable to load APIs. ${error.message}`);
        }
        finally {
            this.working(false);
        }
    }

    private async checkSelection(): Promise<void> {
        if (!this.allowSelection()) {
            return;
        }

        const apiName = this.routeHelper.getApiName();

        if (!apiName) {
            return;
        }

        const api = await this.apiService.getApi(`apis/${apiName}`);

        if (!api) {
            return;
        }

        this.selectedApi(api);
        this.selectedApiName(apiName);
    }

    public prevPage(): void {
        this.page(this.page() - 1);
        this.loadPageOfApis();
    }

    public nextPage(): void {
        this.page(this.page() + 1);
        this.loadPageOfApis();
    }

    public getReferenceUrl(api: Api): string {
        return this.routeHelper.getApiReferenceUrl(api.name, this.detailsPageUrl());
    }

    public async onTagsChange(tags: Tag[]): Promise<void> {
        this.tags(tags);
    }

    @OnDestroyed()
    public dispose(): void {
        this.router.removeRouteChangeListener(this.onRouteChange);
    }
}