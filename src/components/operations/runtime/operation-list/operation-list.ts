import * as ko from "knockout";
import template from "./operation-list.html";
import { SearchRequest } from "./searchRequest";
import { Component, RuntimeComponent, OnMounted } from "@paperbits/common/ko/decorators";
import { ApiService } from "../../../../services/apiService";
import { DefaultRouter, Route } from "@paperbits/common/routing";
import { Operation } from "../../../../models/operation";
import { Page } from "../../../../models/page";

@RuntimeComponent({ selector: "operation-list" })
@Component({
    selector: "operation-list",
    template: template,
    injectable: "operationList"
})
export class OperationList {
    private searchRequest: SearchRequest;
    private currentApiId: string;
    private currentUrl: string;
    private queryParams: URLSearchParams;

    public operations: ko.ObservableArray<Operation>;
    public working: ko.Observable<boolean>;
    public selectedId: ko.Observable<string>;
    public lastPage: ko.Observable<Page<Operation>>;

    constructor(
        private readonly apiService: ApiService,
        private readonly router: DefaultRouter
    ) {
        this.operations = ko.observableArray([]);
        this.working = ko.observable();
        this.selectedId = ko.observable();
        this.lastPage = ko.observable();
        this.loadOperations = this.loadOperations.bind(this);

        this.router.addRouteChangeListener(this.loadOperations);
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        const route = this.router.getCurrentRoute();

        this.loadOperations(route);
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
        this.operations([]);
        this.searchRequest = { pattern: "", tags: [], grouping: "none" };
        await this.searchOperations();
        this.selectFirst();
    }

    public async searchOperations(searchRequest?: SearchRequest): Promise<void> {
        this.working(true);

        this.searchRequest = searchRequest || this.searchRequest;

        try {
            switch (this.searchRequest.grouping) {
                case "none":
                    await this.load();
                    break;

                case "tag":
                    break;

                default:
                    throw new Error("Unexpected groupBy value");
            }
        }
        catch (error) {
            console.error("operation-list error: ", error);
        }
        finally {
            this.working(false);
        }
    }

    private async load(): Promise<void> {
        const pageOfOperations = await this.apiService.getOperations(`apis/${this.currentApiId}`, this.searchRequest);
        this.lastPage(pageOfOperations);
        const current = this.operations();
        if (current && current.length > 0) {
            this.operations.push(...pageOfOperations.value);
        } else {
            this.operations(pageOfOperations.value);
        }
    }

    public async loadMore(): Promise<void> {
        const page = this.lastPage();
        if (page.nextLink) {
            this.searchRequest.skip = page.getSkip();
            if (this.searchRequest.skip) {
                await this.load();
            }
        }
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