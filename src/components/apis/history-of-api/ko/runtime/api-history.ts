import * as ko from "knockout";
import * as Constants from "../../../../../constants";
import template from "./api-history.html";
import { Component, OnMounted, RuntimeComponent, Param } from "@paperbits/common/ko/decorators";
import { Router } from "@paperbits/common/routing";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { ApiService } from "../../../../../services/apiService";
import { Api } from "../../../../../models/api";
import { ChangeLogContract } from "../../../../../contracts/apiChangeLog";
import { Utils } from "../../../../../utils";

@RuntimeComponent({
    selector: "api-history"
})
@Component({
    selector: "api-history",
    template: template
})
export class ApiHistory {
    public api: ko.Observable<Api> = null;
    public apiId: string = null;
    public versionApis: ko.ObservableArray<Api>;
    public apiWorking: ko.Observable<boolean>;
    public changeLogWorking: ko.Observable<boolean>;
    public selectedId: ko.Observable<string>;
    public changeLogHasNextPage: ko.Observable<boolean>;
    public changeLogHasPrevPage: ko.Observable<boolean>;
    public changeLogPage: ko.Observable<number>;
    public changeLogHasPager: ko.Computed<boolean>;
    public currentPageLog: ko.ObservableArray<ChangeLogContract>;

    constructor(
        private readonly apiService: ApiService,
        private readonly router: Router,
        private readonly routeHelper: RouteHelper
    ) {
        this.detailsPageUrl = ko.observable();
        this.api = ko.observable();
        this.versionApis = ko.observableArray([]);
        this.apiWorking = ko.observable(false);
        this.changeLogWorking = ko.observable(false);
        this.selectedId = ko.observable();
        this.loadApi = this.loadApi.bind(this);
        this.currentPageLog = ko.observableArray([]);
        this.changeLogPage = ko.observable(1);
        this.changeLogHasNextPage = ko.observable(false);
        this.changeLogHasPrevPage = ko.observable(false);
        this.changeLogHasPager = ko.computed(() => this.changeLogHasNextPage() || this.changeLogHasPrevPage());
        this.apiId = null;
    }

    @Param()
    public detailsPageUrl: ko.Observable<string>;

    @OnMounted()
    public async initialize(): Promise<void> {
        await this.loadApi();
        this.router.addRouteChangeListener(this.loadApi);
    }

    public async loadApi(): Promise<void> {
        const apiName = this.routeHelper.getApiName();

        if (!apiName) {
            this.api(null);
            return;
        }

        if (this.api() && this.api().name === apiName) {
            return;
        }

        try {
            this.apiWorking(true);

            const api = await this.apiService.getApi(`apis/${apiName}`);

            if (api && api.apiVersionSet && api.apiVersionSet.id) {
                const apis = await this.apiService.getApisInVersionSet(api.apiVersionSet.id);
                this.versionApis(apis || []);
            }
            else {
                this.versionApis([]);
            }
            this.selectedId(api.name);
            this.api(api);
            this.apiId = api.id;
        }
        catch (error) {
            throw new Error(`Unable to load API Info. Error: ${error.message}`);
        }
        finally {
            this.apiWorking(false);
        }
        this.getCurrentPage();
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

    private async getCurrentPage(): Promise<void> {
        try {
            this.changeLogWorking(true);

            const pageOfLogs = await this.apiService.getApiChangeLog(this.apiId, (this.changeLogPage() - 1) * Constants.defaultPageSize);
            pageOfLogs.value.map(x => x.properties.updatedDateTime = Utils.formatDateTime(x.properties.updatedDateTime));

            this.changeLogHasPrevPage(this.changeLogPage() > 1);
            this.changeLogHasNextPage(!!pageOfLogs.nextLink);
            this.currentPageLog(pageOfLogs.value);
        }
        catch (error) {
            throw new Error(`Unable to load API history. Error: ${error.message}`);
        }
        finally {
            this.changeLogWorking(false);
        }
    }

    public getReferenceUrl(): string {
        return this.routeHelper.getApiReferenceUrl(this.selectedId(), this.detailsPageUrl());
    }
}