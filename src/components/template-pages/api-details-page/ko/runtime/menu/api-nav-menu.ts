import * as ko from "knockout";
import * as _ from "lodash";
import template from "./api-nav-menu.html";
import { Component, OnMounted, Param } from "@paperbits/common/ko/decorators";
import { RouteHelper } from "../../../../../../routing/routeHelper";
import { Router } from "@paperbits/common/routing";
import * as Constants from "../../../../../../constants";
import { Api } from "../../../../../../models/api";
import { ApiService } from "../../../../../../services/apiService";
import { GraphDocService } from "../../../../../operations/operation-details/ko/runtime/graphql-documentation/graphql-doc-service";
import { SearchQuery } from "../../../../../../contracts/searchQuery";
import { downloadAPIDefinition } from "../../../../../apis/apiUtils";
import { GraphqlTypesForDocumentation, GraphqlCustomFieldNames } from "../../../../../../constants";
import { menuItem, menuItemType } from "../../../../common/Utils";

interface operationMenuItem extends menuItem {
    method: string;
}

interface tagOperationMenuItem {
    tagName: string;
    operations: ko.ObservableArray<operationMenuItem>;
}

@Component({
    selector: "api-nav-menu",
    template: template,
})
export class ApiNavMenu {
    public readonly staticSelectableMenuItems: menuItem[] = [
        { displayName: "Details", value: "details", type: menuItemType.staticMenuItemType },
        { displayName: "Associated products", value: "products", type: menuItemType.staticMenuItemType },
        { displayName: "Changelog", value: "changelog", type: menuItemType.staticMenuItemType }
    ];

    public readonly wikiDocumentationMenuItems: ko.Observable<menuItem[]>;
    public readonly filteredWikiDocumentationMenuItems: ko.Observable<menuItem[]>;
    public readonly operationsMenuItems: ko.Observable<menuItem[]>;
    public readonly operationsByTagsMenuItems: ko.ObservableArray<tagOperationMenuItem>;
    public readonly pattern: ko.Observable<string>;
    public operationsPageNextLink: ko.Observable<string>;
    public readonly graphqlTypes: ko.ObservableArray<string>;
    public readonly selectedDefinition: ko.Observable<string>;

    public readonly wikiLoading: ko.Observable<boolean>;
    public readonly operationsLoading: ko.Observable<boolean>;
    public readonly moreOperationsLoading: ko.Observable<boolean>;
    public readonly graphqlLoading: ko.Observable<boolean>;


    public readonly graphqlSelectedType: ko.Observable<string>;
    public readonly graphqlNodes: ko.Observable<menuItem[]>;

    @Param()
    public readonly selectedMenuItem: ko.Observable<menuItem>;

    @Param()
    public readonly api: ko.Observable<Api>;

    @Param()
    public groupOperationsByTag: ko.Observable<boolean>;

    @Param()
    public showUrlPath: ko.Observable<boolean>;

    @Param()
    public wrapText: ko.Observable<boolean>;

    @Param()
    public readonly apiLoading: ko.Observable<boolean>;

    @Param()
    public readonly versionApis: ko.ObservableArray<Api>;

    @Param()
    public readonly currentApiVersion: ko.Observable<string>;

    constructor(
        private readonly routeHelper: RouteHelper,
        private readonly router: Router,
        private readonly apiService: ApiService,
        private readonly graphDocService: GraphDocService
    ) {
        this.selectedMenuItem = ko.observable();
        this.wikiDocumentationMenuItems = ko.observable([]);
        this.filteredWikiDocumentationMenuItems = ko.observable([]);
        this.operationsMenuItems = ko.observable([]);
        this.operationsByTagsMenuItems = ko.observableArray([]);
        this.pattern = ko.observable();
        this.operationsPageNextLink = ko.observable();
        this.selectedDefinition = ko.observable();
        this.api = ko.observable();
        this.apiLoading = ko.observable();
        this.versionApis = ko.observableArray([]);
        this.currentApiVersion = ko.observable();

        this.wikiLoading = ko.observable(false);
        this.operationsLoading = ko.observable(false);
        this.moreOperationsLoading = ko.observable(false);
        this.graphqlLoading = ko.observable(false);

        this.graphqlTypes = ko.observableArray([]);
        this.groupOperationsByTag = ko.observable(false);
        this.showUrlPath = ko.observable(false);
        this.wrapText = ko.observable(false);

        this.apiLoading = ko.observable();

        this.graphqlSelectedType = ko.observable();
        this.graphqlNodes = ko.observable();

    }

    @OnMounted()
    public async initialize(): Promise<void> {
        this.apiLoading.subscribe(async (newValue) => {
            if (!newValue) {
                await this.loadWiki();
                await this.loadOperations();
                this.selectMenuItem(this.staticSelectableMenuItems[0]);
            }
        });

        this.pattern
            .extend({ rateLimit: { timeout: Constants.defaultInputDelayMs, method: "notifyWhenChangesStop" } })
            .subscribe(this.search);

        this.router.addRouteChangeListener(this.onRouteChange);

        this.selectedDefinition.subscribe(this.downloadDefinition);
    }

    public selectMenuItem(menuItem: menuItem): void {
        if(!menuItem) {
            return;
        }
        
        if (this.selectedMenuItem() === menuItem) {
            return;
        }

        this.selectedMenuItem(menuItem);

        if (menuItem.type == menuItemType.staticMenuItemType) {
            const apiReferenceUrl = this.routeHelper.getApiDetailsPageReference(this.api().name, menuItem.value);
            this.router.navigateTo(apiReferenceUrl);
        }

        if (menuItem.type == menuItemType.documentationMenuItemType) {
            const wikiUrl = this.routeHelper.getApiDocumentationReferenceUrl(this.api().name, menuItem.value);
            this.router.navigateTo(wikiUrl);
        }

        if (menuItem.type == menuItemType.operationMenuItem) {
            const operationUrl = this.routeHelper.getOperationReferenceUrl(this.api().name, menuItem.value);
            this.router.navigateTo(operationUrl);
        }

        if (menuItem.type == menuItemType.graphqlMenuItem) {
            const graphUrl = this.graphDocService.routeHelper.getGraphReferenceUrl(this.api().name, this.graphDocService.typeIndexer()[this.graphqlSelectedType()], menuItem.value);
            this.router.navigateTo(graphUrl);
        }
    }

    public async loadOperations() {
        this.operationsLoading(true);

        if (this.api().type == "graphql") {
            await this.loadGraphql();
        } else {
            if (this.groupOperationsByTag()) {
                await this.loadOperationsByTags();
            } else {
                await this.loadOperationsUngrouped();
            }
        }

        this.operationsLoading(false);
    }

    public async loadMoreOperationsUngruped(): Promise<void> {
        this.moreOperationsLoading(true);

        const operations = await this.apiService.getMoreOperations(this.operationsPageNextLink());

        const currentOperations = this.operationsMenuItems();
        const newOperations = operations.value.map(o => {
            return {
                value: o.name,
                displayName: this.showUrlPath() ? o.urlTemplate : o.displayName,
                type: menuItemType.operationMenuItem,
                method: o.method
            };
        });

        const operationsMenuItems = [...currentOperations, ...newOperations];

        this.operationsPageNextLink(operations.nextLink);
        this.operationsMenuItems(operationsMenuItems);

        this.moreOperationsLoading(false);
    }

    public async loadMoreOperationsByTags(): Promise<void> {
        this.moreOperationsLoading(true);

        const operationsByTags = await this.apiService.getMoreOperationsByTag(this.operationsPageNextLink());

        const operationsMenuItems = this.operationsByTagsMenuItems();

        const newOperationsByTags = operationsByTags.value.map(t => {
            return {
                tagName: t.tag,
                operations: t.items.map(op => {
                    return {
                        value: op.name,
                        displayName: this.showUrlPath() ? op.urlTemplate : op.displayName,
                        type: menuItemType.operationMenuItem,
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

        this.moreOperationsLoading(false);
    }

    public async loadGraphql() {
        this.graphqlLoading(true);

        await this.graphDocService.initialize();

        this.graphqlSelectedType(GraphqlTypesForDocumentation[this.graphDocService.currentSelected()[GraphqlCustomFieldNames.type]()]);
        this.graphqlTypes(this.graphDocService.availableTypes());

        this.graphqlSelectedType.subscribe(() => {
            this.loadGraphqlNodes();
        });

        this.graphDocService.currentSelected.subscribe((selected: object) => {
            if (selected) {
                this.graphqlSelectedType(GraphqlTypesForDocumentation[this.graphDocService.currentSelected()[GraphqlCustomFieldNames.type]()]);
            }
        });

        this.loadGraphqlNodes();
        this.graphqlLoading(false);
    }

    private loadGraphqlNodes() {
        const collection = this.graphDocService.typeIndexer()[this.graphqlSelectedType()];
        const nodes = _.values(this.graphDocService.docGraphs[collection]());//.filter(node => node.name.toString().toLowerCase().contains(this.pattern()?.toLowerCase));

        this.graphqlNodes(nodes.map((node: any) => {
            return {
                value: node.name,
                displayName: node.name,
                type: menuItemType.graphqlMenuItem,
            };
        }));

        if (this.selectedMenuItem()?.type == menuItemType.graphqlMenuItem) {
            this.selectMenuItem(this.graphqlNodes()[0]);
        }
    }

    private async search() {
        const filteredWikiMenuItems = this.wikiDocumentationMenuItems().filter(x => x.displayName.toLowerCase().includes(this.pattern().toLowerCase()));
        this.filteredWikiDocumentationMenuItems(filteredWikiMenuItems);

        await this.loadOperations();

        if (this.operationsMenuItems().length > 0 || this.operationsByTagsMenuItems().length > 0) {
            document.getElementById("details-operations").setAttribute("open", "");

            this.operationsByTagsMenuItems()?.forEach(x => {
                const id = "details-tag-" + x.tagName;
                document.getElementById(id).setAttribute("open", "");
            });
        }

        if (this.filteredWikiDocumentationMenuItems().length > 0) {
            document.getElementById("details-wiki").setAttribute("open", "");
        }
    }

    private async loadWiki() {
        this.wikiLoading(true);

        const wiki = await this.apiService.getApiWiki(this.api().name);
        this.wikiDocumentationMenuItems(wiki.documents.map(d => {
            return {
                value: d.documentationId,
                displayName: d.documentationId,
                type: menuItemType.documentationMenuItemType
            };
        }));

        this.filteredWikiDocumentationMenuItems(this.wikiDocumentationMenuItems());

        this.wikiLoading(false);
    }

    private async loadOperationsUngrouped(): Promise<void> {
        const searchQuery: SearchQuery = { tags: [], pattern: this.pattern() };
        const operations = await this.apiService.getOperations(`apis/${this.api().name}`, searchQuery);

        const operationsMenuItems = operations.value.map(o => {
            return {
                value: o.name,
                displayName: this.showUrlPath() ? o.urlTemplate : o.displayName,
                type: menuItemType.operationMenuItem,
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
                        value: op.name,
                        displayName: this.showUrlPath() ? op.urlTemplate : op.displayName,
                        type: menuItemType.operationMenuItem,
                        method: op.method
                    };
                }))
            };
        });

        this.operationsPageNextLink(operationsByTags.nextLink);
        this.operationsByTagsMenuItems(operationsMenuItems);
    }

    private async onRouteChange(): Promise<void> {
        const apiName = this.routeHelper.getApiName();

        if (!apiName) {
            return;
        }

        const selectedPage = this.routeHelper.getDetailsPage();
        if (selectedPage) {
            this.selectMenuItem(this.staticSelectableMenuItems.find(x => x.value === selectedPage));
        }

        const selectedDocumentation = this.routeHelper.getDocumentationId();
        if (selectedDocumentation) {
            this.selectMenuItem(this.wikiDocumentationMenuItems().find(x => x.value === selectedDocumentation));
        }

        const selectedOperation = this.routeHelper.getOperationName();
        if (selectedOperation) {
            this.selectMenuItem(this.operationsMenuItems().find(x => x.value === selectedOperation));
        }

    }

    private async downloadDefinition(): Promise<void> {
        const definitionType = this.selectedDefinition();

        if (!definitionType) {
            return;
        }

        if (this.api() && this.api().id) {
            const exportObject = await this.apiService.exportApi(this.api().id, definitionType);
            downloadAPIDefinition(this.api().name, exportObject, definitionType);
        }

        setTimeout(() => this.selectedDefinition(""), 100);
    }
}