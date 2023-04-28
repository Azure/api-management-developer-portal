import * as ko from "knockout";
import template from "./api-details-page.html";
import { Component, OnMounted, Param, RuntimeComponent } from "@paperbits/common/ko/decorators";
import { Api } from "../../../../../models/api";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { ApiService } from "../../../../../services/apiService";
import { Router } from "@paperbits/common/routing";
import { downloadAPIDefinition } from "../../../../../components/apis/apiUtils";
import * as Constants from "../../../../../constants";
import { SearchQuery } from "../../../../../contracts/searchQuery";
import aboutApi from "./staticPages/about-api.html";

interface menuItem {
    displayName: string;
    value: string;
    type: string;
}

interface operationMenuItem extends menuItem {
    method: string;
}

interface tagOperationMenuItem {
    tagName: string;
    operations: ko.ObservableArray<operationMenuItem>;
}

const documentationMenuItemType = "documentation";
const staticMenuItemType = "static";
const operationMenuItem = "operation";


@RuntimeComponent({
    selector: "api-details-page"
})
@Component({
    selector: "api-details-page",
    template: template,
    childTemplates: {
        aboutApi: aboutApi
    }
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
    public readonly currentApiVersion: ko.Observable<string>;
    public readonly selectedMenuItem: ko.Observable<menuItem>;
    public readonly wikiDocumentationMenuItems: ko.Observable<menuItem[]>;
    public readonly filteredWikiDocumentationMenuItems: ko.Observable<menuItem[]>;
    public readonly operationsMenuItems: ko.Observable<menuItem[]>;
    public readonly operationsByTagsMenuItems: ko.ObservableArray<tagOperationMenuItem>;
    public readonly selectedDefinition: ko.Observable<string>;
    public readonly hasOperations: ko.Observable<boolean>;
    public readonly lastModifiedDate: ko.Observable<string>;

    public operationsPageNextLink: ko.Observable<string>;

    @Param()
    public groupOperationsByTag: ko.Observable<boolean>;

    @Param()
    public showUrlPath: ko.Observable<boolean>;

    @Param()
    public wrapText: ko.Observable<boolean>;

    constructor(
        private readonly apiService: ApiService,
        private readonly routeHelper: RouteHelper,
        private readonly router: Router,
    ) {
        this.api = ko.observable();
        this.working = ko.observable(false);
        this.pattern = ko.observable();
        this.versionApis = ko.observableArray([]);

        this.currentApiVersion = ko.observable();
        this.selectedMenuItem = ko.observable(this.staticSelectableMenuItems[0]);
        this.wikiDocumentationMenuItems = ko.observable([]);
        this.filteredWikiDocumentationMenuItems = ko.observable([]);
        this.operationsMenuItems = ko.observable([]);
        this.operationsByTagsMenuItems = ko.observableArray([]);
        this.selectedDefinition = ko.observable();
        this.operationsPageNextLink = ko.observable();
        this.hasOperations = ko.observable();
        this.lastModifiedDate = ko.observable();

        this.groupOperationsByTag = ko.observable();
        this.showUrlPath = ko.observable();
        this.wrapText = ko.observable();
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        this.router.addRouteChangeListener(this.onRouteChange);
        const apiName = this.routeHelper.getApiName();

        if (!apiName) {
            return;
        }

        await this.loadApi(apiName);

        this.currentApiVersion.subscribe(this.onVersionChange);
        this.selectedDefinition.subscribe(this.downloadDefinition);

        this.pattern
            .extend({ rateLimit: { timeout: Constants.defaultInputDelayMs, method: "notifyWhenChangesStop" } })
            .subscribe(this.search);
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

        await this.loadWiki();
        await this.loadOperations();
        this.hasOperations(this.operationsMenuItems().length > 0 || this.operationsByTagsMenuItems().length > 0);

        const currentApiVersion = await this.apiService.getCurrentRevision(apiName);
        this.lastModifiedDate(new Date(currentApiVersion.updatedDateTime).toLocaleDateString());

        this.working(false);
    }

    public selectMenuItem(menuItem: menuItem): void {
        if (this.selectedMenuItem() === menuItem) {
            return;
        }

        this.selectedMenuItem(menuItem);

        if (menuItem.type == documentationMenuItemType) {
            const wikiUrl = this.routeHelper.getDocumentationReferenceUrl(this.api().name, menuItem.value);
            this.router.navigateTo(wikiUrl);
        }
    }

    public async loadOperations() {
        if (this.groupOperationsByTag()) {
            await this.loadOperationsByTags();
        } else {
            await this.loadOperationsUngrouped();
        }
    }

    public async loadMoreOperationsUngruped(): Promise<void> {
        const operations = await this.apiService.getMoreOperations(this.operationsPageNextLink());

        const currentOperations = this.operationsMenuItems();
        const newOperations = operations.value.map(o => {
            return {
                value: o.id,
                displayName: this.showUrlPath() ? o.urlTemplate : o.displayName,
                type: operationMenuItem,
                method: o.method
            };
        });

        const operationsMenuItems = [...currentOperations, ...newOperations];

        this.operationsPageNextLink(operations.nextLink);
        this.operationsMenuItems(operationsMenuItems);
    }

    public async loadMoreOperationsByTags(): Promise<void> {
        const operationsByTags = await this.apiService.getMoreOperationsByTag(this.operationsPageNextLink());

        const operationsMenuItems = this.operationsByTagsMenuItems();

        const newOperationsByTags = operationsByTags.value.map(t => {
            return {
                tagName: t.tag,
                operations: t.items.map(op => {
                    return {
                        value: op.id,
                        displayName: this.showUrlPath() ? op.urlTemplate : op.displayName,
                        type: operationMenuItem,
                        method: op.method
                    };
                })
            };
        });

        for (const tag of newOperationsByTags) {
            const currentTag = operationsMenuItems.find(t => t.tagName === tag.tagName);
            if (currentTag) {
                const index = operationsMenuItems.findIndex(t => t.tagName === tag.tagName);
                operationsMenuItems[index].operations.push(...tag.operations);
            } else {
                operationsMenuItems.push({ tagName: tag.tagName, operations: ko.observableArray(tag.operations) });
            }
        }

        this.operationsPageNextLink(operationsByTags.nextLink);
        this.operationsByTagsMenuItems(operationsMenuItems);
    }

    private async search() {
        await this.loadOperations();

        const filteredWikiMenuItems = this.wikiDocumentationMenuItems().filter(x => x.displayName.toLowerCase().includes(this.pattern().toLowerCase()));
        this.filteredWikiDocumentationMenuItems(filteredWikiMenuItems);

        if (this.operationsMenuItems().length > 0 || this.operationsByTagsMenuItems().length > 0) {
            document.getElementById('details-operations').setAttribute('open', '');

            this.operationsByTagsMenuItems()?.forEach(x => {
                const id = 'details-tag-' + x.tagName;
                document.getElementById(id).setAttribute('open', '');
            });
        }

        if (this.filteredWikiDocumentationMenuItems().length > 0) {
            document.getElementById('details-wiki').setAttribute('open', '');
        }
    }

    private async onRouteChange(): Promise<void> {
        const apiName = this.routeHelper.getApiName();

        if (!apiName || apiName === this.api()?.name) {
            return;
        }

        await this.loadApi(apiName);
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

    private async loadWiki() {
        const wiki = await this.apiService.getApiWiki(this.api().name);
        this.wikiDocumentationMenuItems(wiki.documents.map(d => {
            return {
                value: d.documentationId,
                displayName: d.title,
                type: documentationMenuItemType
            };
        }));

        this.filteredWikiDocumentationMenuItems(this.wikiDocumentationMenuItems());
    }

    private async loadOperationsUngrouped(): Promise<void> {
        const searchQuery: SearchQuery = { tags: [], pattern: this.pattern() };
        const operations = await this.apiService.getOperations(`apis/${this.api().name}`, searchQuery);

        const operationsMenuItems = operations.value.map(o => {
            return {
                value: o.id,
                displayName: this.showUrlPath() ? o.urlTemplate : o.displayName,
                type: operationMenuItem,
                method: o.method
            };
        });

        this.operationsPageNextLink(operations.nextLink);
        this.operationsMenuItems(operationsMenuItems);
    }

    private async loadOperationsByTags(): Promise<void> {
        const searchQuery: SearchQuery = { tags: [], pattern: this.pattern() };
        const operationsByTags = await this.apiService.getOperationsByTags(this.api().name, searchQuery);

        const operationsMenuItems = operationsByTags.value.map(t => {
            return {
                tagName: t.tag,
                operations: ko.observableArray(t.items.map(op => {
                    return {
                        value: op.id,
                        displayName: this.showUrlPath() ? op.urlTemplate : op.displayName,
                        type: operationMenuItem,
                        method: op.method
                    };
                }))
            };
        });

        this.operationsPageNextLink(operationsByTags.nextLink);
        this.operationsByTagsMenuItems(operationsMenuItems);
    }
}