import * as ko from "knockout";
import template from "./api-details.html";
import { Component, OnMounted, RuntimeComponent } from "@paperbits/common/ko/decorators";
import { DefaultRouter, Route } from "@paperbits/common/routing";
import { ApiService } from "../../../../../services/apiService";
import { Api } from "../../../../../models/api";


@RuntimeComponent({ selector: "api-details" })
@Component({
    selector: "api-details",
    template: template,
    injectable: "apiDetails"
})
export class ApiDetails {
    private queryParams: URLSearchParams;
    private isParamChange: boolean;

    public api: ko.Observable<Api> = null;
    public versionApis: ko.ObservableArray<Api>;
    public working: ko.Observable<boolean>;
    public selectedId: ko.Observable<string>;
    public downloadSelected: ko.Observable<string>;

    constructor(
        private readonly apiService: ApiService,
        private readonly router: DefaultRouter
    ) {
        this.api = ko.observable();
        this.versionApis = ko.observableArray([]);
        this.working = ko.observable(false);
        this.selectedId = ko.observable();
        this.downloadSelected = ko.observable("");
        this.loadApi = this.loadApi.bind(this);
        this.onVersionChanged = this.onVersionChanged.bind(this);
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        await this.loadApi(this.router.getCurrentRoute());
        this.router.addRouteChangeListener(this.loadApi);
        this.selectedId.subscribe(this.onVersionChanged);
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
            this.isParamChange = true;
            this.selectedId(api.name);
            this.isParamChange = false;
            this.api(api);
        }

        this.working(false);
    }

    public async onDownloadChange() {
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
                case "openapi": //yaml 3.0
                    fileName = `${fileName}.yaml`;
                    break;
                default:
                    fileName = `${fileName}.json`;
                    exportObject = JSON.stringify(exportObject, null, 4);
                    break
            }
            this.download(exportObject, fileName, fileType);
        }
        this.downloadSelected("");
    }

    public async downloadDefinition(definitionType: "swagger" | "openapi" | "openapi+json" | "wadl" | "wsdl") {
        console.log(definitionType);
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
                case "openapi": //yaml 3.0
                    fileName = `${fileName}.yaml`;
                    break;
                default:
                    fileName = `${fileName}.json`;
                    exportObject = JSON.stringify(exportObject, null, 4);
                    break
            }
            this.download(exportObject, fileName, fileType);
        }
        return;
    }

    private download(data: string, filename: string, type: string) {
        const file = new Blob([data], { type: type });
        if (window.navigator.msSaveOrOpenBlob) // IE10+
            window.navigator.msSaveOrOpenBlob(file, filename);
        else { // Others
            const a = document.createElement("a"),
                url = URL.createObjectURL(file);
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(function () {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
        }
    }

    private onVersionChanged(selectedApiName: string) {
        if (!this.isParamChange && selectedApiName && this.api() && selectedApiName !== this.api().name) {
            this.queryParams.set("apiId", selectedApiName);
            this.queryParams.delete("operationId");
            this.router.navigateTo("#?" + this.queryParams.toString());
        }
    }

    public dispose(): void {
        this.router.removeRouteChangeListener(this.loadApi);
    }
}