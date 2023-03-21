import * as ko from "knockout";
import template from "./api-details-page.html";
import { Component, OnMounted, RuntimeComponent } from "@paperbits/common/ko/decorators";
import { Api } from "../../../../../models/api";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { ApiService } from "../../../../../services/apiService";
import { Router } from "@paperbits/common/routing";
import { downloadAPIDefinition } from "../../../../../components/apis/apiUtils";

interface menuItem {
    displayName: string;
    value: string;
    type: string;
}

const documentationMenuItemType = "documentation";
const staticMenuItemType = "static";
const operationMenuItem = "operation";


@RuntimeComponent({
    selector: "api-details-page"
})
@Component({
    selector: "api-details-page",
    template: template
})
export class ApiDetailsPage {

    public readonly staticSelectableMenuItems: menuItem[] = [
        { displayName: "About this API", value: "about", type: staticMenuItemType },
        { displayName: "Products that use this API", value: "products", type: staticMenuItemType },
        { displayName: "Changelog", value: "changelog", type: staticMenuItemType }
    ]

    public readonly api: ko.Observable<Api>;
    public readonly working: ko.Observable<boolean>;
    public readonly versionApis: ko.ObservableArray<Api>;
    public readonly pattern: ko.Observable<string>;
    public readonly selectedApiName: ko.Observable<string>;
    public readonly currentApiVersion: ko.Observable<string>;
    public readonly selectedMenuItem: ko.Observable<menuItem>;
    public readonly wikiDocumentationMenuItems: ko.Observable<menuItem[]>;
    public readonly operationsMenuItems: ko.Observable<menuItem[]>;
    public readonly selectedDefinition: ko.Observable<string>;

    constructor(
        private readonly apiService: ApiService,
        private readonly routeHelper: RouteHelper,
        private readonly router: Router,
    ) {
        this.api = ko.observable();
        this.working = ko.observable(false);
        this.pattern = ko.observable();
        this.versionApis = ko.observableArray([]);
        this.selectedApiName = ko.observable();

        this.currentApiVersion = ko.observable();
        this.selectedMenuItem = ko.observable(this.staticSelectableMenuItems[0]);
        this.wikiDocumentationMenuItems = ko.observable([]);
        this.operationsMenuItems = ko.observable([]);
        this.selectedDefinition = ko.observable();
    }

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
        this.selectedDefinition.subscribe(this.downloadDefinition);
    }

    private async onRouteChange(): Promise<void> {
        const apiName = this.routeHelper.getApiName();

        if (!apiName || apiName === this.selectedApiName()) {
            return;
        }

        this.selectedApiName(apiName);
        await this.loadApi(apiName);
    }

    public async loadApi(apiName: string): Promise<void> {
        if (!apiName) {
            this.api(null);
            return;
        }

        const api = await this.apiService.getApi(`apis/${apiName}`);
        if (!api) {
            this.api(null);
            return;
        }

        this.working(true);
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


        const wiki = await this.apiService.getApiWiki(apiName);
        this.wikiDocumentationMenuItems(wiki.documents.map(d => { return { value: d.documentationId, displayName: d.title, type: documentationMenuItemType }; }));


        const operations = await this.apiService.getOperations(`apis/${apiName}`);
        this.operationsMenuItems(operations.value.map(o => { return { value: o.id, displayName: o.displayName, type: operationMenuItem }; }))


        this.working(false);
    }

    public selectMenuItem(menuItem: menuItem): void {
        if (this.selectedMenuItem() === menuItem) {
            return;
        }

        this.selectedMenuItem(menuItem);

        if (menuItem.type == documentationMenuItemType) {
            const wikiUrl = this.routeHelper.getDocumentationReferenceUrl(this.selectedApiName(), menuItem.value);
            this.router.navigateTo(wikiUrl);
        }
    }

    private onVersionChange(selectedApiName: string): void {
        const apiName = this.routeHelper.getApiName();

        if (apiName !== selectedApiName) {
            const apiUrl = this.routeHelper.getApiReferenceUrl(selectedApiName);
            this.router.navigateTo(apiUrl);
        }
    }

    private async downloadDefinition(): Promise<void> {
        const definitionType = this.selectedDefinition();

        if (!definitionType) {
            return;
        }

        if (this.api() && this.api().id) {
            let exportObject = await this.apiService.exportApi(this.api().id, definitionType);
            downloadAPIDefinition(this.api().name, exportObject, definitionType);
        }

        setTimeout(() => this.selectedDefinition(""), 100);
    }
}