import * as ko from "knockout";
import template from "./operation-list.html";
import { SearchRequest } from "./searchRequest";
import { Component, RuntimeComponent, OnMounted } from "@paperbits/common/ko/decorators";
import { ApiService } from "../../../../services/apiService";
import { DefaultRouteHandler, Route } from "@paperbits/common/routing";
import { Operation } from "../../../../models/operation";

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

    constructor(
        private readonly apiService: ApiService,
        private readonly routeHandler: DefaultRouteHandler
    ) {
        this.operations = ko.observableArray([]);
        this.working = ko.observable();
        this.selectedId = ko.observable();
        this.loadOperations = this.loadOperations.bind(this);
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        const route = this.routeHandler.getCurrentRoute();

        this.loadOperations(route);

        this.routeHandler.addRouteChangeListener(this.loadOperations);
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

        if (this.currentApiId === apiId && this.operations().length > 0) {
            return;
        }

        this.currentApiId = apiId;
        await this.searchOperations();
        this.selectFirst();
    }

    public async searchOperations(searchRequest?: SearchRequest): Promise<void> {
        this.working(true);

        this.searchRequest = searchRequest || this.searchRequest || { pattern: "", tags: [], grouping: "none" };

        try {
            switch (this.searchRequest.grouping) {
                case "none":
                    const pageOfOperations = await this.apiService.getOperations(`apis/${this.currentApiId}`);
                    this.operations(pageOfOperations.value);
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

    public getNavigationProductId(fullOperationId: string): string {
        if (!fullOperationId) {
            return "#";
        }
        const parts = fullOperationId.split("/operations/");
        const apiId = parts[0].split("/apis/").pop();
        const operationId = parts[1];

        const params = new URLSearchParams();
        params.append("apiId", apiId);
        operationId && params.append("operationId", operationId);

        return `#?${params.toString()}`;
    }

    private selectFirst(): void {
        if (!this.queryParams.has("operationId")) {
            const list = this.operations();
            if (list.length > 0) {
                const selectProductId = list[0].shortId;
                this.selectedId(selectProductId);
                this.queryParams.set("operationId", selectProductId);
                this.routeHandler.navigateTo("#?" + this.queryParams.toString());
            }
        }
    }
}