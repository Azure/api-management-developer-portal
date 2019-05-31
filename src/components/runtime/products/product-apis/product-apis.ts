import * as ko from "knockout";
import template from "./product-apis.html";
import { getUrlHashPart } from "@paperbits/common/utils";
import { Component, RuntimeComponent, OnMounted } from "@paperbits/common/ko/decorators";
import { Product } from "../../../../models/product";
import { IRouteHandler } from "@paperbits/common/routing";
import { ApiService } from "../../../../services/apiService";
import { Api } from "../../../../models/api";

@RuntimeComponent({ selector: "product-apis" })
@Component({
    selector: "product-apis",
    template: template,
    injectable: "productApis"
})
export class ProductApis {
    private currentUrl: string;

    public apis: ko.ObservableArray<Api>;
    public working: ko.Observable<boolean>;

    constructor(
        private readonly apiService: ApiService,
        private readonly routeHandler: IRouteHandler
    ) {
        this.working = ko.observable(true);
        this.apis = ko.observableArray();
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        this.working(true);

        const productId = "";
        const apis = await this.apiService.getProductApis(productId);

        this.apis(apis.value);

        this.working(false);

        // this.routeHandler.addRouteChangeListener(this.loadProducts);
    }

    public selectProduct(product: Product, needNavigation: boolean = true): void {
        // this.selectedProduct = product;
        // if (needNavigation) {
        //     const parts = product.id.split("/");

        //     this.routeHandler.navigateTo(`${this.currentUrl}#${parts[parts.length - 1]}`);
        // }
        // this.showDetails(true);
    }
}