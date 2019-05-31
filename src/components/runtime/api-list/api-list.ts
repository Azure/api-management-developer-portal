import * as ko from "knockout";
import template from "./api-list.html";
import { SearchRequest } from "./searchRequest";
import { Component, RuntimeComponent, Param } from "@paperbits/common/ko/decorators";
import { Utils } from "../../../utils";
import { TagService } from "../../../services/tagService";
import { ApiService } from "../../../services/apiService";
import { DefaultRouteHandler, Route } from "@paperbits/common/routing";
import { Api } from "../../../models/api";

@RuntimeComponent({ selector: "api-list" })
@Component({
    selector: "api-list",
    template: template,
    injectable: "apiList"
})
export class ApiList {
    private searchRequest: SearchRequest;
    private queryParams: URLSearchParams;
    private isParamChange: boolean;

    public apis: ko.ObservableArray<Api>;
    public working: ko.Observable<boolean>;
    public selectedId: ko.Observable<string>;

    constructor(
        private readonly apiService: ApiService,
        private readonly tagService: TagService,
        private readonly routeHandler: DefaultRouteHandler
    ) {
        this.apis = ko.observableArray([]);
        this.itemStyleView = ko.observable();
        this.working = ko.observable();
        this.selectedId = ko.observable();
        this.loadApis = this.loadApis.bind(this);
        this.onSelectApi = this.onSelectApi.bind(this);
        this.selectedId.subscribe(this.onSelectApi);
        this.routeHandler.addRouteChangeListener(this.loadApis);

        this.loadApis();
    }

    @Param()
    public itemStyleView: ko.Observable<string>;

    public itemHeight: ko.Observable<string>;
    public itemWidth: ko.Observable<string>;

    public async loadApis(route?: Route): Promise<void> {
        const currentHash = route && route.hash;
        if (currentHash) {
            this.queryParams = new URLSearchParams(currentHash || "");
            if (this.queryParams.has("apiId")) {
                if(this.selectedId() !== this.queryParams.get("apiId")) {
                    this.isParamChange = true;
                    this.selectedId(this.queryParams.get("apiId"));
                    this.isParamChange = false;
                }
                if (this.apis().length > 0) {
                    return;
                }
            }
        }

        this.queryParams = this.queryParams || new URLSearchParams();

        if (this.apis().length > 0) {
            return;
        }
        // this.itemStyleView("tiles");
        // this.itemStyleView("dropdown");
        await this.searchApis();
    }

    private onSelectApi(selectedId: string) {
        if (this.queryParams) {
            const currentId = this.queryParams.get("apiId");
            if (currentId !== selectedId && !this.isParamChange) {
                this.queryParams.set("apiId", selectedId);
                this.queryParams.delete("operationId");
                this.routeHandler.navigateTo("#?" + this.queryParams.toString());
            }
        }
    }

    // private async loadTags(): Promise<void> {
    //     const pageOfTags = await this.tagService.getTags("apis");
    //     this.tags = pageOfTags.value;
    // }

    // public async ngOnInit(): Promise<void> {
    //     this.searchApis();
    // }

    // public groupByTag(): void {
    //     this.grouping = "tag";
    //     this.searchApis();
    // }

    // public groupByNone(): void {
    //     this.grouping = "none";
    //     this.searchApis();
    // }

    public openApi(item: Api) {
        const selectApiId = item.name;
        this.queryParams.set("apiId", selectApiId);
        this.routeHandler.navigateTo("/apis#?" + this.queryParams.toString(), "");
    }

    public async searchApis(searchRequest?: SearchRequest): Promise<void> {
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
}