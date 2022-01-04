import * as ko from "knockout";
import * as Constants from "../../../../../constants";
import template from "./api-list.html";
import { Component, RuntimeComponent, OnMounted, Param } from "@paperbits/common/ko/decorators";
import { Api } from "../../../../../models/api";
import { ApiService } from "../../../../../services/apiService";
import { TagGroup } from "../../../../../models/tagGroup";
import { SearchQuery } from "../../../../../contracts/searchQuery";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { Tag } from "../../../../../models/tag";


@RuntimeComponent({
    selector: "api-list"
})
@Component({
    selector: "api-list",
    template: template
})
export class ApiList {
    public readonly apis: ko.ObservableArray<Api>;
    public readonly apiGroups: ko.ObservableArray<TagGroup<Api>>;
    public readonly working: ko.Observable<boolean>;
    public readonly pattern: ko.Observable<string>;
    public readonly tags: ko.Observable<Tag[]>;
    public readonly groupByTag: ko.Observable<boolean>;
    public readonly pageNumber: ko.Observable<number>;
    public readonly totalPages: ko.Observable<number>;

    constructor(
        private readonly apiService: ApiService,
        private readonly routeHelper: RouteHelper
    ) {
        this.detailsPageUrl = ko.observable();
        this.allowSelection = ko.observable(false);
        this.showApiType = ko.observable(true);
        this.apis = ko.observableArray([]);
        this.working = ko.observable();
        this.pattern = ko.observable();
        this.tags = ko.observable([]);
        this.pageNumber = ko.observable(1);
        this.totalPages = ko.observable(0);
        this.apiGroups = ko.observableArray();
        this.groupByTag = ko.observable(false);
        this.defaultGroupByTagToEnabled = ko.observable(false);
    }

    @Param()
    public allowSelection: ko.Observable<boolean>;

    @Param()
    public showApiType: ko.Observable<boolean>;

    @Param()
    public defaultGroupByTagToEnabled: ko.Observable<boolean>;

    @Param()
    public detailsPageUrl: ko.Observable<string>;

    @OnMounted()
    public async initialize(): Promise<void> {
        this.groupByTag(this.defaultGroupByTagToEnabled());
        this.tags.subscribe(this.resetSearch);

        await this.resetSearch();

        this.pattern
            .extend({ rateLimit: { timeout: Constants.defaultInputDelayMs, method: "notifyWhenChangesStop" } })
            .subscribe(this.resetSearch);

        this.groupByTag
            .subscribe(this.resetSearch);

        this.pageNumber
            .subscribe(this.loadPageOfApis);
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

            let totalItems: number;

            if (this.groupByTag()) {
                const pageOfTagResources = await this.apiService.getApisByTags(query);
                const apiGroups = pageOfTagResources.value;

                this.apiGroups(apiGroups);
                totalItems = pageOfTagResources.count;
            }
            else {
                const pageOfApis = await this.apiService.getApis(query);
                const apis = pageOfApis ? pageOfApis.value : [];

                this.apis(apis);
                totalItems = pageOfApis.count;
            }

            this.totalPages(Math.ceil(totalItems / Constants.defaultPageSize));
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

    public async resetSearch(): Promise<void> {
        this.pageNumber(1);
        this.loadPageOfApis();
    }

    public async onTagsChange(tags: Tag[]): Promise<void> {
        this.tags(tags);
    }
}