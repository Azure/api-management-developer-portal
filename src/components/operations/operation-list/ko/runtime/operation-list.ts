import * as ko from "knockout";
import * as Constants from "../../../../../constants";
import template from "./operation-list.html";
import { Router } from "@paperbits/common/routing";
import { Component, RuntimeComponent, OnMounted, OnDestroyed, Param } from "@paperbits/common/ko/decorators";
import { ApiService } from "../../../../../services/apiService";
import { Operation } from "../../../../../models/operation";
import { SearchQuery } from "../../../../../contracts/searchQuery";
import { TagGroup } from "../../../../../models/tagGroup";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { Tag } from "../../../../../models/tag";
import { Utils } from "../../../../../utils";


@RuntimeComponent({
    selector: "operation-list"
})
@Component({
    selector: "operation-list",
    template: template
})
export class OperationList {
    private searchRequest: SearchQuery;

    public readonly selectedApiName: ko.Observable<string>;
    public readonly selectedOperationName: ko.Observable<string>;
    public readonly operations: ko.ObservableArray<Operation>;
    public readonly working: ko.Observable<boolean>;
    public readonly groupByTag: ko.Observable<boolean>;
    public readonly operationGroups: ko.ObservableArray<TagGroup<Operation>>;
    public readonly pattern: ko.Observable<string>;
    public readonly tags: ko.Observable<Tag[]>;
    public readonly pageNumber: ko.Observable<number>;
    public readonly hasPrevPage: ko.Observable<boolean>;
    public readonly hasNextPage: ko.Observable<boolean>;
    public readonly hasPager: ko.Computed<boolean>;
    public readonly tagScope: ko.Computed<string>;
    public readonly showUrlPath: ko.Observable<boolean>;

    constructor(
        private readonly apiService: ApiService,
        private readonly router: Router,
        private readonly routeHelper: RouteHelper
    ) {
        this.detailsPageUrl = ko.observable();
        this.allowSelection = ko.observable(false);
        this.wrapText = ko.observable();

        this.showUrlPath = ko.observable();
        this.defaultShowUrlPath = ko.observable();
        this.showToggleUrlPath = ko.observable();

        this.operations = ko.observableArray();
        this.operationGroups = ko.observableArray();
        this.selectedApiName = ko.observable();
        this.selectedOperationName = ko.observable().extend(<any>{ acceptChange: this.allowSelection });
        this.working = ko.observable(false);
        this.groupByTag = ko.observable(false);
        this.defaultGroupByTagToEnabled = ko.observable(false);
        this.pattern = ko.observable();
        this.tags = ko.observable([]);
        this.pageNumber = ko.observable(1);
        this.hasNextPage = ko.observable();
        this.hasPrevPage = ko.observable();
        this.hasPager = ko.computed(() => this.hasPrevPage() || this.hasNextPage());
        this.tagScope = ko.computed(() => this.selectedApiName() ? `apis/${this.selectedApiName()}`: "");
    }

    @Param()
    public allowSelection: ko.Observable<boolean>;

    @Param()
    public wrapText: ko.Observable<boolean>;

    @Param()
    public defaultShowUrlPath: ko.Observable<boolean>;

    @Param()
    public showToggleUrlPath: ko.Observable<boolean>;

    @Param()
    public defaultGroupByTagToEnabled: ko.Observable<boolean>;

    @Param()
    public detailsPageUrl: ko.Observable<string>;

    @OnMounted()
    public async initialize(): Promise<void> {
        const apiName = this.routeHelper.getApiName();
        const operationName = this.routeHelper.getOperationName();

        this.selectedApiName(apiName);
        this.selectedOperationName(operationName);

        this.groupByTag(this.defaultGroupByTagToEnabled());
        this.tags.subscribe(this.resetSearch);

        this.showUrlPath(this.defaultShowUrlPath());

        if (this.selectedApiName()) {
            await this.loadOperations();
        }

        this.pattern
            .extend({ rateLimit: { timeout: Constants.defaultInputDelayMs, method: "notifyWhenChangesStop" } })
            .subscribe(this.resetSearch);

        this.groupByTag
            .subscribe(this.loadOperations);

        this.router.addRouteChangeListener(this.onRouteChange);
    }

    private async onRouteChange(): Promise<void> {
        const apiName = this.routeHelper.getApiName();
        const operationName = this.routeHelper.getOperationName();

        if (apiName !== this.selectedApiName()) {
            this.selectedApiName(apiName);
            this.selectedOperationName(null);
            await this.resetSearch();
            return;
        }

        if (operationName !== this.selectedOperationName()) {
            this.selectedOperationName(operationName);
        }
    }

    public async loadOperations(): Promise<void> {
        if (this.groupByTag()) {
            this.operationGroups([]);
            this.searchRequest = { pattern: this.pattern(), tags: this.tags(), grouping: "tag" };
        }
        else {
            this.operations([]);
            this.searchRequest = { pattern: this.pattern(), tags: this.tags(), grouping: "none" };
        }

        this.searchRequest.propertyName = this.showUrlPath() ? 'urlTemplate' : undefined;

        try {
            this.working(true);

            if (this.groupByTag()) {
                await this.loadOfOperationsByTag();
            }
            else {
                await this.loadPageOfOperations();
            }

            if (this.allowSelection() && !this.selectedOperationName()) {
                this.selectFirstOperation();
            }
        }
        catch (error) {
            throw new Error(`Unable to load operations: Error: ${error.message}`);
        }
        finally {
            this.working(false);
        }
    }

    private async loadOfOperationsByTag(): Promise<void> {
        this.searchRequest.skip = (this.pageNumber() - 1) * Constants.defaultPageSize;

        const pageOfOperationsByTag = await this.apiService.getOperationsByTags(this.selectedApiName(), this.searchRequest);
        const operationGroups = pageOfOperationsByTag.value;

        this.operationGroups(operationGroups);

        this.hasPrevPage(this.pageNumber() > 1);
        this.hasNextPage(!!pageOfOperationsByTag.nextLink);
    }

    private async loadPageOfOperations(): Promise<void> {
        const apiName = this.selectedApiName();

        if (!apiName) {
            return;
        }

        this.searchRequest.skip = (this.pageNumber() - 1) * Constants.defaultPageSize;
        const pageOfOperations = await this.apiService.getOperations(`apis/${apiName}`, this.searchRequest);

        this.operations(pageOfOperations.value);

        this.hasPrevPage(this.pageNumber() > 1);
        this.hasNextPage(!!pageOfOperations.nextLink);
    }

    private selectFirstOperation(): void {
        let operationName;

        if (this.groupByTag()) {
            const groups = this.operationGroups();

            if (groups.length < 1 || groups[0].items.length < 1) {
                return;
            }

            operationName = groups[0].items[0].name;
        }
        else {
            const operations = this.operations();

            if (operations.length < 1) {
                return;
            }

            operationName = operations[0].name;
        }

        this.selectedOperationName(operationName);

        const operationUrl = this.routeHelper.getOperationReferenceUrl(this.selectedApiName(), operationName, this.detailsPageUrl());
        this.router.navigateTo(operationUrl);
    }

    public getReferenceUrl(operation: Operation): string {
        const apiName = this.routeHelper.getApiName();
        return this.routeHelper.getOperationReferenceUrl(apiName, operation.name, this.detailsPageUrl());
    }

    public async resetSearch(): Promise<void> {
        this.pageNumber(1);
        this.loadOperations();
    }

    public prevPage(): void {
        this.pageNumber(this.pageNumber() - 1);

        if (this.groupByTag()) {
            this.loadOfOperationsByTag();
        }
        else {
            this.loadPageOfOperations();
        }
    }

    public nextPage(): void {
        this.pageNumber(this.pageNumber() + 1);

        if (this.groupByTag()) {
            this.loadOfOperationsByTag();
        }
        else {
            this.loadPageOfOperations();
        }
    }

    public async onTagsChange(tags: Tag[]): Promise<void> {
        this.tags(tags);
    }

    @OnDestroyed()
    public dispose(): void {
        this.router.removeRouteChangeListener(this.onRouteChange);
    }
}