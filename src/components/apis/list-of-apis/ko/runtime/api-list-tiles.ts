import * as ko from "knockout";
import * as Constants from "../../../../../constants";
import template from "./api-list-tiles.html";
import { Component, RuntimeComponent, OnMounted, Param } from "@paperbits/common/ko/decorators";
import { ApiService } from "../../../../../services/apiService";
import { Api } from "../../../../../models/api";
import { TagGroup } from "../../../../../models/tagGroup";
import { SearchQuery } from "../../../../../contracts/searchQuery";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { Tag } from "../../../../../models/tag";


@RuntimeComponent({
    selector: "api-list-tiles"
})
@Component({
    selector: "api-list-tiles",
    template: template
})
export class ApiListTiles {
    public readonly apis: ko.ObservableArray<Api>;
    public readonly apiGroups: ko.ObservableArray<TagGroup<Api>>;
    public readonly working: ko.Observable<boolean>;
    public readonly pattern: ko.Observable<string>;
    public readonly tags: ko.Observable<Tag[]>;
    public readonly groupByTag: ko.Observable<boolean>;
    public readonly groupTagsExpanded: ko.Observable<Set<string>>;
    public readonly pageNumber: ko.Observable<number>;
    public readonly nextPage: ko.Observable<boolean>;

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
        this.nextPage = ko.observable();
        this.apiGroups = ko.observableArray();
        this.groupByTag = ko.observable(false);
        this.defaultGroupByTagToEnabled = ko.observable(false);
        this.groupTagsExpanded = ko.observable(new Set<string>());
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

    public getReferenceUrl(api: Api): string {
        return this.routeHelper.getApiReferenceUrl(api.name, this.detailsPageUrl());
    }

    public async resetSearch(): Promise<void> {
        this.pageNumber(1);
        this.loadPageOfApis();
    }

    public groupTagCollapseToggle(tag: string): void {
        const newSet = this.groupTagsExpanded();
        newSet.has(tag) ? newSet.delete(tag) : newSet.add(tag);
        this.groupTagsExpanded(newSet);
    }

    public async onTagsChange(tags: Tag[]): Promise<void> {
        this.tags(tags);
    }
}