import * as ko from "knockout";
import template from "./api-history.html";
import { Component, OnMounted, RuntimeComponent } from "@paperbits/common/ko/decorators";
import { DefaultRouter, Route } from "@paperbits/common/routing";
import { ApiService } from "../../../../../services/apiService";
import { Api } from "../../../../../models/api";
import { ChangeLog } from "../../../../../models/changeLog";


@RuntimeComponent({ selector: "api-history" })
@Component({
    selector: "api-history",
    template: template,
    injectable: "apiHistory"
})
export class ApiHistory {
    private queryParams: URLSearchParams;
    private readonly pageSize: number;

    public api: ko.Observable<Api> = null;
    public versionApis: ko.ObservableArray<Api>;
    public working: ko.Observable<boolean>;
    public selectedId: ko.Observable<string>;
    public changeLog: ko.ObservableArray<ChangeLog>;
    public changeLogHasNextPage: ko.Observable<boolean>;
    public changeLogHasPrevPage: ko.Observable<boolean>;
    public changeLogPage: ko.Observable<number>;
    public changeLogHasPager: ko.Computed<boolean>;
    public currentPageLog: ko.ObservableArray<ChangeLog>;

    constructor(
        private readonly apiService: ApiService,
        private readonly router: DefaultRouter
    ) {
        this.api = ko.observable();
        this.versionApis = ko.observableArray([]);
        this.working = ko.observable(false);
        this.selectedId = ko.observable();
        this.loadApi = this.loadApi.bind(this);
        this.changeLog = ko.observableArray([]);
        this.currentPageLog = ko.observableArray([]);
        this.changeLogPage = ko.observable(1);
        this.changeLogHasNextPage = ko.observable(false);
        this.changeLogHasPrevPage = ko.observable(false);
        this.changeLogHasPager =  ko.computed(() => this.changeLogHasNextPage() || this.changeLogHasPrevPage());
        this.pageSize = 1;
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        await this.loadApi(this.router.getCurrentRoute());
        this.router.addRouteChangeListener(this.loadApi);
    }

    public async loadApi(route?: Route): Promise<void> {
        if (!route || !route.hash) {
            this.api(null);
            return;
        }
        const currentHash = route.hash;

        this.queryParams = new URLSearchParams(currentHash);

        if (!this.queryParams.has("apiId")) {
            this.api(null);
            return;
        }

        const apiName = this.queryParams.get("apiId");
        if (this.api() && this.api().name === apiName) {
            return;
        }
        
        this.working(true);
        if (apiName) {
            const api = await this.apiService.getApi(`apis/${apiName}`);
            if (api.apiVersionSet && api.apiVersionSet.id) {
                const apis = await this.apiService.getVersionSetApis(api.apiVersionSet.id);
                this.versionApis(apis || []);
            } else {
                this.versionApis([]);
            }
            const changelogs = await this.apiService.getApiChangeLog(api.id);
            this.selectedId(api.name);
            this.api(api);
            this.changeLog(changelogs.value);
            this.getCurrentPage();
        }
        this.working(false);
    }

    public dispose(): void {
        this.router.removeRouteChangeListener(this.loadApi);
    }

    public changeLogNextPage(): void {
        this.changeLogPage(this.changeLogPage() + 1);
        this.getCurrentPage();
    }

    public changeLogPrevPage(): void {
        this.changeLogPage(this.changeLogPage() - 1);
        this.getCurrentPage();
    }

    private getCurrentPage(): void {
        var idx = (this.changeLogPage() - 1) * this.pageSize;
        if (this.changeLog().length < this.pageSize + idx) {
            this.currentPageLog(this.changeLog().slice(idx, this.changeLog().length));
        } else {
            this.currentPageLog(this.changeLog().slice(idx, this.pageSize + idx))
        }
        this.changeLogHasPrevPage(this.changeLogPage() > 1);
        this.changeLogHasNextPage(this.changeLog().length > this.pageSize + idx);
    }
}