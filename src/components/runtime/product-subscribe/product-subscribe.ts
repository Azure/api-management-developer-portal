import * as ko from "knockout";
import template from "./product-subscribe.html";
import { IRouteHandler } from "@paperbits/common/routing";
import { matchUrl } from "@paperbits/common/utils";
import { Component, OnMounted } from "@paperbits/common/ko/decorators";
import { RuntimeComponent } from "@paperbits/common/ko/decorators";
import { Utils } from "../../../utils";
import { Product } from "../../../models/product";
import { ProductService } from "../../../services/productService";
import { UsersService } from "../../../services/usersService";
import { IAuthenticator } from "../../../services/IAuthenticator";

@RuntimeComponent({ selector: "product-subscribe" })
@Component({
    selector: "product-subscribe",
    template: template,
    injectable: "productSubscribe"
})
export class ProductSubscribe {
    private readonly urlTemplate = "/products/{id}/subscribe";

    public product: KnockoutObservable<Product>;
    public showTerms: KnockoutObservable<boolean>;
    public isAgreed: KnockoutObservable<boolean>;
    public termsOfUse: KnockoutObservable<string>;
    public showHideLabel: KnockoutObservable<string>;
    public subscriptionName: KnockoutObservable<string>;

    constructor(
        private readonly usersService: UsersService,
        private readonly productService: ProductService,
        private readonly routeHandler: IRouteHandler,
        private readonly authenticator: IAuthenticator
    ) {
        this.product = ko.observable();
        this.showTerms = ko.observable();
        this.isAgreed = ko.observable(false);
        this.termsOfUse = ko.observable();
        this.showHideLabel = ko.observable();
        this.subscriptionName = ko.observable();

        this.loadProduct = this.loadProduct.bind(this);
        this.confirm = this.confirm.bind(this);
        this.cancel = this.cancel.bind(this);
        this.isChangesReady = this.isChangesReady.bind(this);
        this.routeHandler.addRouteChangeListener(this.loadProduct);

        // this.isAgreed.subscribe((val) => console.log("isAgreed changed: " + val));
    }

    @OnMounted()
    public async loadProduct(): Promise<void> {
        const route = this.routeHandler.getCurrentUrl();        

        if (route === this.urlTemplate || decodeURI(route) === this.urlTemplate) {
            // This is a layout design time 
            return;
        }
        const routeVars = matchUrl(route, this.urlTemplate);
        if (!routeVars || routeVars.length === 0) {
            // This is error
            return;
        }

        const userId = this.usersService.getCurrentUserId();
        if (!userId && this.usersService.isUserLoggedIn()) {
            location.assign("/signin");
        }

        const productId = `/products/${routeVars[0].value}`;
        const product = await this.productService.getProduct(productId);
        if (product) {     
            this.product(product);
            this.subscriptionName(product.name);
            if (product.terms) {
                this.termsOfUse(product.terms);
                this.showHideLabel("Show");
                this.showTerms(false);
            }
        }
    }

    public async confirm(): Promise<void> {
        const userId = this.usersService.getCurrentUserId();
        if (!this.isChangesReady()) {
            return;
        }

        if (userId && this.usersService.isUserLoggedIn() && this.subscriptionName() !== "") {
            const subscriptionId = `/subscriptions/${Utils.getBsonObjectId()}`;
            await this.productService.createUserSubscription(subscriptionId, userId, this.product().id, this.subscriptionName());
            location.assign("/profile");
        } else {
            location.assign("/signin");
        }
    }

    public cancel(): void {
        this.routeHandler.navigateTo(this.product().id);
    }

    public isChangesReady(): boolean {
        return (!!this.subscriptionName() && this.subscriptionName().length > 0) && 
                    ((this.termsOfUse() && this.isAgreed()) || !!!this.termsOfUse());
    }

    public toggle(): void {
        if (this.showTerms()) {
            this.showHideLabel("Show");
        } 
        else {
            this.showHideLabel("Hide");
        }
        this.showTerms(!this.showTerms());
    }

    // public setAgree() {
    //     this.isAgreed(!this.isAgreed());
    //     return this.isAgreed();
    // }
}