import * as ko from "knockout";
import template from "./api-details.html";
import { Component, OnMounted, RuntimeComponent, OnDestroyed, Param } from "@paperbits/common/ko/decorators";
import { Router } from "@paperbits/common/routing";
import { ApiService } from "../../../../../services/apiService";
import { Api } from "../../../../../models/api";
import { RouteHelper } from "../../../../../routing/routeHelper";


@RuntimeComponent({ selector: "api-details" })
@Component({
    selector: "api-details",
    template: template,
    injectable: "apiDetails"
})
export class ApiDetails {
    public readonly api: ko.Observable<Api>;
    public readonly selectedApiName: ko.Observable<string>;
    public readonly currentApiVersion: ko.Observable<string>;
    public readonly versionApis: ko.ObservableArray<Api>;
    public readonly working: ko.Observable<boolean>;
    public readonly downloadSelected: ko.Observable<string>;

    constructor(
        private readonly apiService: ApiService,
        private readonly routeHelper: RouteHelper,
        private readonly router: Router,
    ) {
        this.changeLogPageUrl = ko.observable();
        this.api = ko.observable();
        this.selectedApiName = ko.observable();
        this.versionApis = ko.observableArray([]);
        this.working = ko.observable(false);
        this.currentApiVersion = ko.observable();
        this.downloadSelected = ko.observable("");
        this.loadApi = this.loadApi.bind(this);
    }

    @Param()
    public changeLogPageUrl: ko.Observable<string>;

    @OnMounted()
    public async initialize(): Promise<void> {
        const apiName = this.routeHelper.getApiName();

        if (!apiName) {
            return;
        }

        this.selectedApiName(apiName);
        await this.loadApi(apiName);

        this.router.addRouteChangeListener(this.onRouteChange);
        this.currentApiVersion.subscribe(this.onVersionChange);
    }

    private async onRouteChange(): Promise<void> {
        const apiName = this.routeHelper.getApiName();

        if (!apiName || apiName === this.selectedApiName()) {
            return;
        }

        this.api(null);
        this.selectedApiName(apiName);
        this.loadApi(apiName);
    }

    public async loadApi(apiName: string): Promise<void> {
        this.working(true);

        const api = await this.apiService.getApi(`apis/${apiName}`);

        if (api.apiVersionSet && api.apiVersionSet.id) {
            const apis = await this.apiService.getApisInVersionSet(api.apiVersionSet.id);
            this.versionApis(apis || []);
        }
        else {
            this.versionApis([]);
        }

        this.currentApiVersion(api.name);
        this.api(api);

        this.working(false);
    }

    public async onDownloadChange(): Promise<void> {
        const definitionType = this.downloadSelected();

        if (!definitionType) {
            return;
        }

        if (this.api() && this.api().id) {
            let exportObject = await this.apiService.exportApi(this.api().id, definitionType);
            let fileName = this.api().name;
            let fileType = "application/json";

            switch (definitionType) {
                case "wadl":
                case "wsdl":
                    fileType = "text/xml";
                    fileName = `${fileName}.xml`;
                    break;
                case "openapi": // yaml 3.0
                    fileName = `${fileName}.yaml`;
                    break;
                default:
                    fileName = `${fileName}.json`;
                    exportObject = JSON.stringify(exportObject, null, 4);
                    break;
            }
            this.download(exportObject, fileName, fileType);
        }

        this.downloadSelected("");
    }

    public async downloadDefinition(definitionType: "swagger" | "openapi" | "openapi+json" | "wadl" | "wsdl"): Promise<void> {
        if (this.api() && this.api().id) {
            let exportObject = await this.apiService.exportApi(this.api().id, definitionType);
            let fileName = this.api().name;
            let fileType = "application/json";

            switch (definitionType) {
                case "wadl":
                case "wsdl":
                    fileType = "text/xml";
                    fileName = `${fileName}.xml`;
                    break;
                case "openapi": // yaml 3.0
                    fileName = `${fileName}.yaml`;
                    break;
                default:
                    fileName = `${fileName}.json`;
                    exportObject = JSON.stringify(exportObject, null, 4);
                    break;
            }
            this.download(exportObject, fileName, fileType);
        }
        return;
    }

    private download(data: string, filename: string, type: string): void {
        const file = new Blob([data], { type: type });

        if (window.navigator.msSaveOrOpenBlob) { // IE10+
            window.navigator.msSaveOrOpenBlob(file, filename);
        }
        else { // Others
            const a = document.createElement("a"),
                url = URL.createObjectURL(file);
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();

            setTimeout(() => {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
        }
    }

    private onVersionChange(selectedApiName: string): void {
        const apiUrl = this.routeHelper.getApiReferenceUrl(selectedApiName);
        this.router.navigateTo(apiUrl);
    }

    public getChanglogUrl() {
        return this.routeHelper.getApiReferenceUrl(this.selectedApiName(), this.changeLogPageUrl());
    }

    @OnDestroyed()
    public dispose(): void {
        this.router.removeRouteChangeListener(this.loadApi);
    }
}