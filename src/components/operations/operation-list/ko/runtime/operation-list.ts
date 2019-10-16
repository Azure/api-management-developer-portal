import * as ko from "knockout";
import template from "./operation-list.html";
import { Component, RuntimeComponent, OnMounted } from "@paperbits/common/ko/decorators";
import { ApiService } from "../../../../../services/apiService";
import { DefaultRouter, Route } from "@paperbits/common/routing";
import { Operation } from "../../../../../models/operation";
import { SearchQuery } from "../../../../../contracts/searchQuery";
import { TagGroup } from "../../../../../models/tagGroup";
import * as Constants from "../../../../../constants";

@RuntimeComponent({ selector: "operation-list" })
@Component({
    selector: "operation-list",
    template: template,
    injectable: "operationList"
})
export class OperationList {
    private searchRequest: SearchQuery;
    private currentApiId: string;
    private currentUrl: string;
    private queryParams: URLSearchParams;

    public operations: ko.ObservableArray<Operation>;
    public working: ko.Observable<boolean>;
    public selectedId: ko.Observable<string>;
    public readonly groupByTag: ko.Observable<boolean>;
    public readonly opsGroups: ko.ObservableArray<TagGroup<Operation>>;
    public readonly pattern: ko.Observable<string>;
    public readonly pageNumber: ko.Observable<number>;
    public readonly hasPrePage: ko.Observable<boolean>;
    public readonly hasNextPage: ko.Observable<boolean>;
    public readonly hasPager: ko.Computed<boolean>;

    constructor(
        private readonly apiService: ApiService,
        private readonly router: DefaultRouter
    ) {
        this.operations = ko.observableArray([]);
        this.working = ko.observable();
        this.selectedId = ko.observable();
        this.loadOperations = this.loadOperations.bind(this);
        this.groupByTag = ko.observable(true);
        this.router.addRouteChangeListener(this.loadOperations);
        this.opsGroups = ko.observableArray();
        this.pattern = ko.observable();
        this.pageNumber = ko.observable(1);
        this.hasNextPage = ko.observable();
        this.hasPrePage = ko.observable();
        this.hasPager = ko.computed(() => this.hasPrePage() || this.hasNextPage());
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        const route = this.router.getCurrentRoute();
        await this.loadOperations(route);
        this.pattern
            .extend({ rateLimit: { timeout: Constants.defaultInputDelayMs, method: "notifyWhenChangesStop" } })
            .subscribe(this.searchOperationsByPattern);

        this.groupByTag
            .subscribe(this.updateOperations);
    }

    public async loadOperations(route?: Route): Promise<void> {
        if (!route || !route.hash) {
            return;
        }
        const currentUrl = route.url;
        const currentHash = route.hash;

        if (currentUrl === this.currentUrl && this.operations().length > 0) {
            return;
        }

        this.currentUrl = currentUrl;

        this.queryParams = new URLSearchParams(currentHash);
        if (!this.queryParams.has("apiId")) {
            return;
        }

        if (this.queryParams.has("operationId")) {
            const selectedOperationId = this.queryParams.get("operationId");
            this.selectedId(selectedOperationId);
        }

        const apiId = this.queryParams.get("apiId");
        if (apiId === "undefined" || apiId === "null") {
            return;
        }

        if (this.currentApiId === apiId) {
            return;
        }

        this.currentApiId = apiId;
        await this.updateOperations();
        this.selectFirst();
    }

    public async searchOperationsByPattern(): Promise<void> {
        this.pageNumber(1);
        this.updateOperations();
    }

    public prePage(): void {
        this.pageNumber(this.pageNumber() - 1);
        if (this.groupByTag()) {
            this.loadBytag();
        } else {
            this.load();
        }
    }

    public nextPage(): void {
        this.pageNumber(this.pageNumber() + 1);
        if (this.groupByTag()) {
            this.loadBytag();
        } else {
            this.load();
        }
    }

    public async updateOperations() {
        if (this.groupByTag()) {
            this.opsGroups([]);
            this.searchRequest = { pattern: this.pattern(), tags: [], grouping: "tag" };
        } else {
            this.operations([]);
            this.searchRequest = { pattern: this.pattern(), tags: [], grouping: "none" };
        }
        await this.searchOperations();
    }

    public async searchOperations(searchRequest?: SearchQuery): Promise<void> {
        this.working(true);

        this.searchRequest = searchRequest || this.searchRequest;

        try {
            switch (this.searchRequest.grouping) {
                case "none":
                    await this.load();
                    break;

                case "tag":
                    await this.loadBytag();
                    break;

                default:
                    throw new Error("Unexpected groupBy value");
            }
        }
        catch (error) {
            throw error;
        }
        finally {
            this.working(false);
        }
    }

    public clickGroupByTag(): void {
        this.groupByTag(!this.groupByTag());
        if (this.groupByTag()) {
            this.searchRequest.grouping = "tag";
        } else {
            this.searchRequest.grouping = "none";
        }
        this.searchOperations();
    }

    private async loadBytag(): Promise<void> {
        this.searchRequest.skip = (this.pageNumber() - 1) * Constants.defaultPageSize;
        const pageOfOperationsByTag = await this.apiService.getOperationsByTags(this.currentApiId, this.searchRequest);
        const operationGroups = pageOfOperationsByTag.value;
        this.opsGroups(operationGroups);
        this.hasPrePage(this.pageNumber() > 1);
        this.hasNextPage(!!pageOfOperationsByTag.nextLink);
    }

    private async load(): Promise<void> {
        this.searchRequest.skip = (this.pageNumber() - 1) * Constants.defaultPageSize;
        const pageOfOperations = await this.apiService.getOperations(`apis/${this.currentApiId}`, this.searchRequest);

        this.operations(pageOfOperations.value);

        this.hasPrePage(this.pageNumber() > 1);
        this.hasNextPage(!!pageOfOperations.nextLink);
    }

    public selectOperationWithTag(operation: Operation): void {
        if (!operation) {
            return;
        }
        const parts = operation.id.split("/operations/");
        const apiId = parts[0].split("/apis/").pop();
        const operationId = parts[1];

        const params = new URLSearchParams();
        params.append("apiId", apiId);
        operationId && params.append("operationId", operationId);

        this.router.navigateTo("#?" + params.toString());
    }

    public selectOperation(operation: Operation): void {
        if (!operation) {
            return;
        }
        const parts = operation.id.split("/operations/");
        const apiId = parts[0].split("/apis/").pop();
        const operationId = parts[1];

        const params = new URLSearchParams();
        params.append("apiId", apiId);
        operationId && params.append("operationId", operationId);

        this.router.navigateTo("#?" + params.toString());
    }

    private selectFirst(): void {
        if (!this.queryParams.has("operationId")) {
            const list = this.operations();
            if (list.length > 0) {
                const selectId = list[0].shortId;
                this.selectedId(selectId);
                this.queryParams.set("operationId", selectId);
                this.router.navigateTo("#?" + this.queryParams.toString());
            }
        }
    }

    public dispose(): void {
        this.router.removeRouteChangeListener(this.loadOperations);
    }
}