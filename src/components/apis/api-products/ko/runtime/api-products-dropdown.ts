import * as ko from "knockout";
import * as Constants from "../../../../../constants";
import template from "./api-products-dropdown.html";
import { Component, RuntimeComponent, OnMounted, Param, OnDestroyed } from "@paperbits/common/ko/decorators";
import { Router } from "@paperbits/common/routing";
import { ApiService } from "../../../../../services/apiService";
import { SearchQuery } from "../../../../../contracts/searchQuery";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { Product } from "../../../../../models/product";

@RuntimeComponent({
  selector: "api-products-dropdown-runtime",
})
@Component({
  selector: "api-products-dropdown-runtime",
  template: template,
})
export class ApiProductsDropdown {
  public readonly products: ko.ObservableArray<Product>;
  public readonly selectedApiName: ko.Observable<string>;
  public readonly working: ko.Observable<boolean>;
  public readonly pattern: ko.Observable<string>;
  public readonly pageNumber: ko.Observable<number>;
  public readonly nextPage: ko.Observable<boolean>;
  public readonly selectedProduct: ko.Observable<Product>;
  public readonly selectedProductName: ko.Observable<string>;
  public readonly selection: ko.Computed<string>;

  constructor(
    private readonly apiService: ApiService,
    private readonly router: Router,
    private readonly routeHelper: RouteHelper
  ) {
    this.detailsPageUrl = ko.observable();
    this.allowSelection = ko.observable(false);
    this.products = ko.observableArray([]);
    this.selectedApiName = ko.observable();
    this.working = ko.observable();
    this.pattern = ko.observable();
    this.pageNumber = ko.observable(1);
    this.nextPage = ko.observable();
    this.selectedProduct = ko.observable();
    this.selectedProductName = ko.observable();
    this.selection = ko.computed(() => {
        const product = ko.unwrap(this.selectedProduct);
        return product ? product.displayName : "Select API: products";
    });
  }

  @Param()
  public allowSelection: ko.Observable<boolean>;

  @Param()
  public detailsPageUrl: ko.Observable<string>;

  @OnMounted()
  public async initialize(): Promise<void> {
    const apiName = this.routeHelper.getApiName();

    if (apiName) {
      this.selectedApiName(apiName);
    }

    await this.resetSearch();

    this.pattern
    .extend({ rateLimit: { timeout: Constants.defaultInputDelayMs, method: "notifyWhenChangesStop" } })
    .subscribe(this.resetSearch);

    this.router.addRouteChangeListener(this.onRouteChange);
    this.pageNumber.subscribe(this.loadPageOfProducts);
  }

  /**
   * Initiates searching products.
   */
   public async resetSearch(): Promise<void> {
        this.pageNumber(1);
        this.loadPageOfProducts();
    }

  private async onRouteChange(): Promise<void> {
    const apiName = this.routeHelper.getApiName();

    if (
      !apiName ||
      (apiName === this.selectedApiName())
    ) {
      await this.resetSearch();
      return;
    }

    this.selectedApiName(apiName);
    await this.loadPageOfProducts();

    await this.resetSearch();
  }

  /**
   * Loads page of products.
   */
  public async loadPageOfProducts(): Promise<void> {
    try {
        this.working(true);

        const pageNumber = this.pageNumber() - 1;

        const query: SearchQuery = {
            pattern: this.pattern(),
            skip: pageNumber * Constants.defaultPageSize,
            take: Constants.defaultPageSize
        };

      const apiName = this.selectedApiName();

      const pageOfProducts = await this.apiService.getApiProductsPage(apiName, query);

      this.products(pageOfProducts.value);
      this.nextPage(!!pageOfProducts.nextLink);

      const productName = this.routeHelper.getProductName();

            if (productName) {
                this.selectedProduct(pageOfProducts.value.find(item => item.id.endsWith(productName)));
             }
    }
    catch (error) {
        throw new Error(`Unable to load API Products. Error: ${error.message}`);
    }
    finally {
        this.working(false);
    }
  }

    public getProductUrl(product: Product): string {
        return this.routeHelper.getProductReferenceUrl(product.name, this.detailsPageUrl());
    }

    @OnDestroyed()
    public dispose(): void {
        this.router.removeRouteChangeListener(this.onRouteChange);
    }
}