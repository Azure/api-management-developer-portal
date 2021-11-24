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
    public readonly page: ko.Observable<number>;
    public readonly hasPager: ko.Computed<boolean>;
    public readonly hasPrevPage: ko.Observable<boolean>;
    public readonly hasNextPage: ko.Observable<boolean>;
    public readonly groupByTag: ko.Observable<boolean>;
    public totalNoOfItems: ko.Observable<number>;   //pagination changes

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
        this.page = ko.observable(1);
        this.hasPrevPage = ko.observable();
        this.hasNextPage = ko.observable();
        this.hasPager = ko.computed(() => this.hasPrevPage() || this.hasNextPage());
        this.apiGroups = ko.observableArray();
        this.groupByTag = ko.observable(false);
        this.defaultGroupByTagToEnabled = ko.observable(false);
        this.totalNoOfItems = ko.observable();  //pagination changes
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

        this.groupByTag.subscribe(this.resetSearch);
    }

    /**
     * Loads page of APIs.
     */
    public async loadPageOfApis(): Promise<void> {
        const pageNumber = this.page() - 1;

        const query: SearchQuery = {
            pattern: this.pattern(),
            tags: this.tags(),
            skip: pageNumber * Constants.defaultPageSize,
            take: Constants.defaultPageSize
        };

        let nextLink;

        try {
            this.working(true);

            if (this.groupByTag()) {
                const pageOfTagResources = await this.apiService.getApisByTags(query);
                const apiGroups = pageOfTagResources.value;

                this.apiGroups(apiGroups);

                nextLink = pageOfTagResources.nextLink;
                this.totalNoOfItems(pageOfTagResources.count);  //pagination changes
            }
            else {
                const pageOfApis = await this.apiService.getApis(query);
                const apis = pageOfApis ? pageOfApis.value : [];
                this.apis(apis);

                nextLink = pageOfApis.nextLink;
                this.totalNoOfItems(pageOfApis.count);  //pagination changes
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

    //Get total page count - pagination changes
    public getPageTotal() : number {
        var totalPages = Math.ceil(this.totalNoOfItems() / Constants.defaultPageSize);
        if (this.page() > totalPages && totalPages > 0) {
            this.page(totalPages);
        }
        return totalPages
    }

    //Navigate to page number - pagination changes
    public changePageTo(newPage:string) {
        return function() {
          switch (newPage) {
            case "last":
                this.page(this.getPageTotal());
              break;
            case "first":
                this.page(1);
              break;
            default:
                this.page(newPage);
          }
          this.loadPageOfApis();
        }
    }

    //Change page by - pagination changes
    public changePageBy(offset){
        return function() {
            this.page(this.page() + offset);
            this.loadPageOfApis();
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

    public async resetSearch(): Promise<void> {
        this.page(1);
        this.loadPageOfApis();
    }

    public async onTagsChange(tags: Tag[]): Promise<void> {
        this.tags(tags);
    }
}