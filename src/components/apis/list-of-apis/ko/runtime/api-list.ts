import * as ko from "knockout";
import template from "./api-list.html";
import { ApiSearchQuery } from "../../../../../contracts/apiSearchQuery";
import { Component, RuntimeComponent, Param, OnMounted } from "@paperbits/common/ko/decorators";
import { Utils } from "../../../../../utils";
import { TagService } from "../../../../../services/tagService";
import { ApiService } from "../../../../../services/apiService";
import { DefaultRouter, Route } from "@paperbits/common/routing";
import { Api } from "../../../../../models/api";


@RuntimeComponent({ selector: "api-list" })
@Component({
    selector: "api-list",
    template: template,
    injectable: "apiList"
})
export class ApiList {
    private searchRequest: ApiSearchQuery;
    private queryParams: URLSearchParams;

    public apis: ko.ObservableArray<Api>;
    public working: ko.Observable<boolean>;
    public selectedId: ko.Observable<string>;
    public dropDownId: ko.Observable<string>;

    constructor(
        private readonly apiService: ApiService,
        private readonly tagService: TagService,
        private readonly router: DefaultRouter
    ) {
        this.apis = ko.observableArray([]);
        this.itemStyleView = ko.observable();
        this.working = ko.observable();
        this.selectedId = ko.observable();
        this.dropDownId = ko.observable();
        this.loadApis = this.loadApis.bind(this);
        this.applySelectedApi = this.applySelectedApi.bind(this);
        this.selectFirst = this.selectFirst.bind(this);
        this.selectionChanged = this.selectionChanged.bind(this);
    }

    @Param()
    public itemStyleView: ko.Observable<string>;

    @OnMounted()
    public async initialize(): Promise<void> {
        await this.loadApis(this.router.getCurrentRoute());
        this.router.addRouteChangeListener(this.loadApis);
    }

    public itemHeight: ko.Observable<string>;
    public itemWidth: ko.Observable<string>;

    public async loadApis(route?: Route): Promise<void> {
        const currentHash = route && route.hash;
        if (currentHash) {
            this.queryParams = new URLSearchParams(currentHash);

            if (this.queryParams.has("apiId")) {
                if (this.apis().length === 0) {
                    await this.searchApis();
                }
                this.applySelectedApi();
                return;
            }
        }

        this.queryParams = this.queryParams || new URLSearchParams();

        if (this.apis().length > 0) {
            return;
        }
        await this.searchApis();

        this.selectFirst();
    }

    private applySelectedApi(): void {
        const currentId = this.selectedId();
        const selectedId = this.queryParams.get("apiId");
        if (selectedId === currentId) {
            return;
        }
        this.selectedId(selectedId);

        if (this.itemStyleView() === "dropdown" && this.dropDownId() !== selectedId) {
            this.dropDownId(selectedId);
        }
        
        this.queryParams.set("apiId", selectedId);
        this.router.navigateTo("#?" + this.queryParams.toString());
    }

    public selectionChanged(change, event): void {
        if (event.originalEvent) { // user changed
            const currentId = this.queryParams.get("apiId");
            const selectedId = this.dropDownId();
            if (selectedId === currentId) {
                return;
            }
            this.queryParams.set("apiId", selectedId);
            this.queryParams.delete("operationId");
            this.router.navigateTo("#?" + this.queryParams.toString());
        }
    }

    private selectFirst(): void {
        if (this.itemStyleView() === "tiles" || this.queryParams.has("apiId")) {
            return;
        }

        const list = this.apis();

        if (list.length > 0) {
            const selectedId = list[0].name;
            this.queryParams.set("apiId", selectedId);
            this.applySelectedApi();
        }
    }

    public async searchApis(searchRequest?: ApiSearchQuery): Promise<void> {
        this.working(true);

        this.searchRequest = searchRequest || this.searchRequest || { pattern: "", tags: [], grouping: "none" };

        switch (this.searchRequest.grouping) {
            case "none":
                const pageOfApis = await this.apiService.getApis(searchRequest);
                const apis = pageOfApis ? pageOfApis.value : [];
                this.apis(this.groupApis(apis));

                break;

            case "tag":
                const pageOfTagResources = await this.apiService.getApisByTags(searchRequest);
                const tagResources = pageOfTagResources ? pageOfTagResources.value : [];
                // TODO: this.tagResourcesToNodes(tagResources);

                break;

            default:
                throw new Error("Unexpected groupBy value");
        }

        this.working(false);
    }

    private groupApis(apis: Api[]): Api[] {
        apis = apis.filter(x => x.isCurrent);
        const result = apis.filter(x => !x.apiVersionSet);
        const versionedApis = apis.filter(x => !!x.apiVersionSet);
        const groups = Utils.groupBy(versionedApis, x => x.apiVersionSet.id);
        result.push(...groups.map(g => g[g.length - 1]));
        return result;
    }

    public dispose(): void {
        this.router.removeRouteChangeListener(this.loadApis);
    }
}