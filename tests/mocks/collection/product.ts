import { ProductContract } from "../../../src/contracts/product";
import { TestUtils } from "../../testUtils";
import { Resource } from "./resource";
import { ProductContract as SmapiProductContract } from "../../models/productContract";

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

    public getRequestContract(): SmapiProductContract{
        return {
            properties: {
                displayName: this.productName,
                description: "",
                approvalRequired: false,
                state: "published",
                subscriptionRequired: true,
                subscriptionsLimit: 101,
                terms: ""
            }
        };
    }

    public getResponseContract(): ProductContract{
        return {
            id: this.productId,
            name: this.productName,
            description: "",
            approvalRequired: false,
            subscriptionRequired: true,
            subscriptionsLimit: 2,
            terms: ""
        };
    }

    public getRequestId(): string{
        return `products/${this.productId}`;
    }

    public static getRandomProduct(testId: string){
        var productName = TestUtils.randomIdentifier();
        return new Product(testId, productName, productName);
    }
}
