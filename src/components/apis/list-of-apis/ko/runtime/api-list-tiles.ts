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
import { Utils } from "../../../../../utils";


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
    public readonly selectedApiName: ko.Observable<string>;
    public readonly working: ko.Observable<boolean>;
    public readonly pattern: ko.Observable<string>;
    public readonly tags: ko.Observable<Tag[]>;
    public readonly page: ko.Observable<number>;
    public readonly hasPager: ko.Computed<boolean>;
    public readonly hasPrevPage: ko.Observable<boolean>;
    public readonly hasNextPage: ko.Observable<boolean>;
    public readonly groupByTag: ko.Observable<boolean>;

    constructor(
        private readonly apiService: ApiService,
        private readonly routeHelper: RouteHelper
    ) {
        this.detailsPageUrl = ko.observable();
        this.allowSelection = ko.observable(false);
        this.apis = ko.observableArray([]);
        this.working = ko.observable();
        this.selectedApiName = ko.observable().extend(<any>{ acceptChange: this.allowSelection });
        this.pattern = ko.observable();
        this.tags = ko.observable([]);
        this.page = ko.observable(1);
        this.hasPrevPage = ko.observable();
        this.hasNextPage = ko.observable();
        this.hasPager = ko.computed(() => this.hasPrevPage() || this.hasNextPage());
        this.apiGroups = ko.observableArray();
        this.groupByTag = ko.observable(false);
        this.defaultGroupByTagToEnabled = ko.observable(false);
    }

    @Param()
    public allowSelection: ko.Observable<boolean>;

    @Param()
    public defaultGroupByTagToEnabled: ko.Observable<boolean>;

    @Param()
    public detailsPageUrl: ko.Observable<string>;

    @OnMounted()
    public async initialize(): Promise<void> {
        this.groupByTag(this.defaultGroupByTagToEnabled());

        await this.resetSearch();

        this.pattern
            .extend({ rateLimit: { timeout: Constants.defaultInputDelayMs, method: "notifyWhenChangesStop" } })
            .subscribe(this.resetSearch);

        this.tags
            .subscribe(this.resetSearch);

        this.groupByTag
            .subscribe(this.resetSearch);
    }

    public prevPage(): void {
        this.page(this.page() - 1);
        this.loadPageOfApis();
    }

    public nextPage(): void {
        this.page(this.page() + 1);
        this.loadPageOfApis();
    }

    /**
     * Initiates searching APIs.
     */
    public async resetSearch(): Promise<void> {
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
                tags: this.tags(),
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
            throw new Error(`Unable to load APIs. Error: ${error.message}`);
        }
        finally {
            this.working(false);
        }
    }

    public getReferenceUrl(api: Api): string {
        return this.routeHelper.getApiReferenceUrl(api.name, this.detailsPageUrl());
    }

    public async onTagsChange(tags: Tag[]): Promise<void> {
        this.tags(tags);
    }
}