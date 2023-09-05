import * as ko from "knockout";
import { Component, OnMounted, Param } from "@paperbits/common/ko/decorators";
import template from "./product-nav-menu.html";
import { menuItem, menuItemType } from "../../../../common/Utils";
import { ProductService } from "../../../../../../services/productService";
import { Product } from "../../../../../../models/product";
import { Router } from "@paperbits/common/routing";
import { RouteHelper } from "../../../../../../routing/routeHelper";
import * as Constants from "../../../../../../constants";

@Component({
    selector: "product-nav-menu",
    template: template
})
export class ProductNavMenu {
    public readonly staticSelectableMenuItems: menuItem[] = [
        { displayName: "Details", value: "details", type: menuItemType.staticMenuItemType },
        { displayName: "Associated APIs", value: "apis", type: menuItemType.staticMenuItemType },
        { displayName: "Subscriptions", value: "subscriptions", type: menuItemType.staticMenuItemType }
    ];

    public readonly pattern: ko.Observable<string>;
    public readonly wikiDocumentationMenuItems: ko.Observable<menuItem[]>;
    public readonly filteredWikiDocumentationMenuItems: ko.Observable<menuItem[]>;
    public readonly wikiLoading: ko.Observable<boolean>;

    @Param()
    public readonly product: ko.Observable<Product>;

    @Param()
    public readonly selectedMenuItem: ko.Observable<menuItem>;

    @Param()
    public readonly wrapText: ko.Observable<boolean>;

    @Param()
    public readonly productLoading: ko.Observable<boolean>;

    constructor(
        private readonly productService: ProductService,
        private readonly routeHelper: RouteHelper,
        private readonly router: Router
    ) {
        this.pattern = ko.observable();
        this.selectedMenuItem = ko.observable();
        this.wrapText = ko.observable();
        this.productLoading = ko.observable();
        this.wikiDocumentationMenuItems = ko.observable([]);
        this.filteredWikiDocumentationMenuItems = ko.observable([]);
        this.wikiLoading = ko.observable(true);
        this.product = ko.observable();
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        this.productLoading.subscribe(async (newValue) => {
            if (!newValue) {
                await this.loadWiki();
                this.selectMenuItem(this.staticSelectableMenuItems[0]);
            }
        });

        this.pattern
            .extend({ rateLimit: { timeout: Constants.defaultInputDelayMs, method: "notifyWhenChangesStop" } })
            .subscribe(this.search);


        this.router.addRouteChangeListener(this.onRouteChange);
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
            const productReferenceUrl = this.routeHelper.getProductDetailsPageReference(this.product().name, menuItem.value);
            this.router.navigateTo(productReferenceUrl);
        }

        if (menuItem.type == menuItemType.documentationMenuItemType) {
            const wikiUrl = this.routeHelper.getProductDocumentationReferenceUrl(this.product().name, menuItem.value);
            this.router.navigateTo(wikiUrl);
        }
    }

    private async loadWiki() {
        this.wikiLoading(true);

        const wiki = await this.productService.getProductWiki(this.product().name);
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

    private async onRouteChange(): Promise<void> {
        const productName = this.routeHelper.getProductName();

        if (!productName) {
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
    }

    private async search() {
        const filteredWikiMenuItems = this.wikiDocumentationMenuItems().filter(x => x.displayName.toLowerCase().includes(this.pattern().toLowerCase()));
        this.filteredWikiDocumentationMenuItems(filteredWikiMenuItems);

        if (this.filteredWikiDocumentationMenuItems().length > 0) {
            document.getElementById("details-wiki").setAttribute("open", "");
        }
    }
}