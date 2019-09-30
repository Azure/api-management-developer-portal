import * as ko from "knockout";
import template from "./product-apis.html";
import { Component, RuntimeComponent, OnMounted } from "@paperbits/common/ko/decorators";
import { Router } from "@paperbits/common/routing";
import { ApiService } from "../../../../../services/apiService";
import { Api } from "../../../../../models/api";


@RuntimeComponent({ selector: "product-apis-runtime" })
@Component({
    selector: "product-apis-runtime",
    template: template,
    injectable: "productApis"
})
export class ProductApis {
    public apis: ko.ObservableArray<Api>;
    public working: ko.Observable<boolean>;

    constructor(
        private readonly apiService: ApiService,
        private readonly router: Router
    ) {
        this.working = ko.observable(true);
        this.apis = ko.observableArray();
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        this.router.addRouteChangeListener(this.loadProductApis);

        await this.loadProductApis();
    }

    private getProductId(): string {
        const route = this.router.getCurrentRoute();
        const queryParams = new URLSearchParams(route.hash);
        const productId = queryParams.get("productId");

        return productId ? `/products/${productId}` : null;
    }

    private async loadProductApis(): Promise<void> {
        try {
            this.working(true);

            const productId = this.getProductId();

            if (!productId) {
                return;
            }

            const apis = await this.apiService.getProductApis(productId);

            this.apis(apis.value);
        }
        catch (error) {
            // Notify user?
            debugger;
        }
        finally {
            this.working(false);
        }
    }

    public dispose(): void {
        this.router.removeRouteChangeListener(this.loadProductApis);
    }
}