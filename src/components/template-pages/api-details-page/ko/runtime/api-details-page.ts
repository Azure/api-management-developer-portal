import * as ko from "knockout";
import template from "./api-details-page.html";
import { Component, OnMounted, Param, RuntimeComponent } from "@paperbits/common/ko/decorators";
import { Api } from "../../../../../models/api";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { ApiService } from "../../../../../services/apiService";
import { Router } from "@paperbits/common/routing";
import aboutApi from "./staticPages/about-api.html";
import { menuItem, breadcrumbItem, menuItemType } from "../../../common/Utils";
import operationDetails from "../../../../operations/operation-details/ko/runtime/operation-details.html";

@RuntimeComponent({
    selector: "api-details-page"
})
@Component({
    selector: "api-details-page",
    template: template,
    childTemplates: {
        aboutApi: aboutApi,
        operationDetails: operationDetails
    },
})
export class ApiDetailsPage {
    public readonly api: ko.Observable<Api>;
    public readonly lastModifiedDate: ko.Observable<string>;
    public readonly breadcrumbItems: ko.Observable<breadcrumbItem[]>;
    public readonly apiLoading: ko.Observable<boolean>;
    public readonly operationDetailsConfig: ko.Observable<string>;
    public readonly selectedMenuItem: ko.Observable<menuItem>;
    public readonly versionApis: ko.ObservableArray<Api>;
    public readonly currentApiVersion: ko.Observable<string>;

    @Param()
    public groupOperationsByTag: ko.Observable<boolean>;

    @Param()
    public showUrlPath: ko.Observable<boolean>;

    @Param()
    public wrapText: ko.Observable<boolean>;

    @Param()
    public enableConsole: ko.Observable<boolean>;

    @Param()
    public defaultSchemaView: ko.Observable<string>;

    @Param()
    public useCorsProxy: ko.Observable<boolean>;

    @Param()
    public includeAllHostnames: ko.Observable<boolean>;

    @Param()
    public showExamples: ko.Observable<boolean>;

    constructor(
        private readonly apiService: ApiService,
        private readonly routeHelper: RouteHelper,
        private readonly router: Router
    ) {
        this.api = ko.observable();
        this.apiLoading = ko.observable(true);
        this.lastModifiedDate = ko.observable();
        this.breadcrumbItems = ko.observableArray([]);
        this.selectedMenuItem = ko.observable();
        this.versionApis = ko.observableArray([]);
        this.currentApiVersion = ko.observable();

        this.groupOperationsByTag = ko.observable();
        this.showUrlPath = ko.observable();
        this.wrapText = ko.observable();
        this.operationDetailsConfig = ko.observable();
        this.enableConsole = ko.observable();
        this.defaultSchemaView = ko.observable();
        this.useCorsProxy = ko.observable();
        this.includeAllHostnames = ko.observable();
        this.showExamples = ko.observable();
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        this.router.addRouteChangeListener(this.onRouteChange);
        const apiName = this.routeHelper.getApiName();

        if (!apiName) {
            return;
        }

        await this.loadApi(apiName);

        const config = JSON.stringify({ "enableConsole": this.enableConsole(), "defaultSchemaView": this.defaultSchemaView(), "useCorsProxy": this.useCorsProxy(), "includeAllHostnames": this.includeAllHostnames(), "showExamples": this.showExamples() });
        this.operationDetailsConfig(config);

        this.selectedMenuItem.subscribe((menuItem) => {
            let url = ""

            if (menuItem.type === menuItemType.staticMenuItemType) {
                url = this.routeHelper.getApiDetailsPageReference(this.api().name, menuItem.value);
            }

            if (menuItem.type === menuItemType.operationMenuItem) {
                url = this.routeHelper.getOperationReferenceUrl(this.api().name, menuItem.value);
            }

            if (menuItem.type === menuItemType.documentationMenuItemType) {
                url = this.routeHelper.getProductDocumentationReferenceUrl(this.api().name, menuItem.value);
            }

            const breadcrumbs = this.breadcrumbItems();
            breadcrumbs.pop();
            breadcrumbs.push({ title: menuItem.displayName, url: url });
            this.breadcrumbItems(breadcrumbs);
        });

        this.currentApiVersion.subscribe(this.onVersionChange);
    }

    public async loadApi(apiName: string): Promise<void> {
        this.apiLoading(true);

        if (!apiName) {
            this.api(null);
            return;
        }

        const api = await this.apiService.getApi(`apis/${apiName}`);
        if (!api) {
            this.api(null);
            return;
        }

        if (api.apiVersionSet && api.apiVersionSet.id) {
            const apis = await this.apiService.getApisInVersionSet(api.apiVersionSet.id);
            apis.forEach(x => x.apiVersion = x.apiVersion || "Original");

            this.versionApis(apis || []);
        }
        else {
            this.versionApis([]);
        }

        this.currentApiVersion(api.name);

        this.api(api);
        this.initializeBreadcrumbItems();

        const lastModifiedDate = await this.apiService.getLastModifiedDate(`apis/${apiName}`);
        if (lastModifiedDate) {
            this.lastModifiedDate(new Date(lastModifiedDate).toLocaleDateString());
        }

        this.apiLoading(false);
    }

    private async onRouteChange(): Promise<void> {
        const apiName = this.routeHelper.getApiName();

        if (!apiName || apiName === this.api()?.name) {
            return;
        }
        await this.loadApi(apiName);
    }

    private initializeBreadcrumbItems() {
        const apiReferenceUrl = this.routeHelper.getApiReferenceUrl(this.api().name);
        this.breadcrumbItems([{ title: "Home", url: "/" },
        { title: "APIs", url: "/apis" },
        { title: this.api().name, url: this.routeHelper.getApiDetailsPageReference(this.api().name, "details") },
        { title: "Details", url: apiReferenceUrl }])
    }

    private onVersionChange(selectedApiName: string): void {
        const apiName = this.routeHelper.getApiName();

        if (apiName !== selectedApiName) {
            const apiUrl = this.routeHelper.getApiReferenceUrl(selectedApiName);
            this.router.navigateTo(apiUrl);
        }
    }
}