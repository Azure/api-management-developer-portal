import { ProductContract } from "../../../src/contracts/product";
import { Utils } from "../../utils";
import { Resource } from "./resource";

export class Product extends Resource{
    public productId: string;
    public productName: string;
    public responseContract: ProductContract;
    
    public constructor(testId: string, productId: string, productName: string){
        super(testId);
        this.productId = productId;
        this.productName = productName;
        this.responseContract = this.getResponseContract();
    }

    private getProperties(): any{
        return {
            displayName: this.productName,
            description: "",
            approvalRequired: false,
            state: "published",
            subscriptionRequired: true,
            subscriptionsLimit: 2,
            terms: ""
        }
    }

    public getContract(): ProductContract{
        return {
            properties: this.getProperties()
        };
    }

    public getResponseContract(): ProductContract{
        return {
            id: `/subscriptions/sid/resourceGroups/rgid/providers/Microsoft.ApiManagement/service/sid/products/${this.productId}`,
            type: "Microsoft.ApiManagement/service/products",
            name: this.productId,
            properties: this.getProperties()
        };
    }

    public getRequestId(): string{
        return `products/${this.productId}`;
    }

    public static getRandomProduct(testId: string){
        var productName = Utils.randomIdentifier();
        return new Product(testId, productName, productName);
    }
}
