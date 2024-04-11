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
import { Tag } from "../../../../../models/tag";


@RuntimeComponent({
    selector: "api-list-dropdown"
})
@Component({
    selector: "api-list-dropdown",
    template: template
})
export class ApiListDropdown {
    public readonly apis: ko.ObservableArray<Api>;
    public readonly apiGroups: ko.ObservableArray<TagGroup<Api>>;
    public readonly selectedApi: ko.Observable<Api>;
    public readonly selectedApiName: ko.Observable<string>;
    public readonly working: ko.Observable<boolean>;
    public readonly pattern: ko.Observable<string>;
    public readonly tags: ko.Observable<Tag[]>;
    public readonly pageNumber: ko.Observable<number>;
    public readonly nextPage: ko.Observable<boolean>;
    public readonly selection: ko.Computed<string>;
    public readonly groupByTag: ko.Observable<boolean>;
    public readonly groupTagsExpanded: ko.Observable<Set<string>>;

    constructor(
        private readonly apiService: ApiService,
        private readonly router: Router,
        private readonly routeHelper: RouteHelper
    ) {
        this.apis = ko.observableArray([]);
        this.detailsPageUrl = ko.observable();
        this.allowSelection = ko.observable(false);
        this.defaultGroupByTagToEnabled = ko.observable(false);
        this.groupByTag = ko.observable(false);
        this.groupTagsExpanded = ko.observable(new Set<string>());
        this.working = ko.observable();
        this.selectedApi = ko.observable();
        this.selectedApiName = ko.observable();
        this.pattern = ko.observable();
        this.tags = ko.observable([]);
        this.pageNumber = ko.observable(1);
        this.nextPage = ko.observable();
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

    @Param()
    public defaultGroupByTagToEnabled: ko.Observable<boolean>;


    @OnMounted()
    public async initialize(): Promise<void> {
        this.groupByTag(this.defaultGroupByTagToEnabled());

        await this.resetSearch();
        await this.checkSelection();

        this.pattern
            .extend({ rateLimit: { timeout: Constants.defaultInputDelayMs, method: "notifyWhenChangesStop" } })
            .subscribe(this.resetSearch);

        this.tags
            .subscribe(this.resetSearch);

        this.groupByTag
            .subscribe(this.resetSearch);

        this.router.addRouteChangeListener(this.onRouteChange);
        this.pageNumber.subscribe(this.loadPageOfApis);
    }

    /**
     * Initiates searching APIs.
     */
    public async resetSearch(): Promise<void> {
        this.pageNumber(1);
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
        const pageNumber = this.pageNumber() - 1;

        const query: SearchQuery = {
            pattern: this.pattern(),
            tags: this.tags(),
            skip: pageNumber * Constants.defaultPageSize,
            take: Constants.defaultPageSize
        };

        try {
            this.working(true);

            let nextLink: string | null;

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

            this.nextPage(!!nextLink);
        }
        catch (error) {
            throw new Error(`Unable to load APIs. Error: ${error.message}`);
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

    public getReferenceUrl(api: Api): string {
        return this.routeHelper.getApiReferenceUrl(api.name, this.detailsPageUrl());
    }

    public async onTagsChange(tags: Tag[]): Promise<void> {
        this.tags(tags);
    }

    public groupTagCollapseToggle(tag: string): void {
        const newSet = this.groupTagsExpanded();
        newSet.has(tag) ? newSet.delete(tag) : newSet.add(tag);
        this.groupTagsExpanded(newSet);
    }

    public closeDropdown(): true {
        const apiDropdowns = document.getElementsByClassName("api-list-dropdown");
        for (let i = 0; i < apiDropdowns.length; i++) {
            if (apiDropdowns[i].classList.contains("show"))
                apiDropdowns[i].classList.remove("show");
        }

        return true; // return true to not-prevent the default action https://knockoutjs.com/documentation/click-binding.html#note-3-allowing-the-default-click-action
    }

    @OnDestroyed()
    public dispose(): void {
        this.router.removeRouteChangeListener(this.onRouteChange);
    }
}