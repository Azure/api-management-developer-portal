import { SubscriptionContract } from "../../../src/contracts/subscription";
import { SubscriptionContract as SmapiSubscriptionContract } from "../../models/subscriptionContract";
import { TestUtils } from "../../testUtils";
import { Resource } from "./resource";
import { User } from "./user";
import { Product } from "./product";

export class Subscription extends Resource{
    public displayName: string;
    public id: string;

    public user: User;
    public product: Product;

    public responseContract: any;

    public constructor(testId: string, user: User, product: Product, id: string, displayName: string){
        super(testId);
        this.displayName = displayName;
        this.id = id;

        this.user = user;
        this.product = product;

        this.responseContract = this.getResponseContract();
    }

    public getResponseContract(): SubscriptionContract{
        return {
            id: this.id,
            name: this.displayName,
            ownerId: this.user.publicId,
            scope: `/subscriptions/sid/resourceGroups/rgid/providers/Microsoft.ApiManagement/service/sid/products/${this.product.productId}`,
            state: "active",
            createdDate: new Date().toISOString(),
            startDate: new Date().toISOString(),
            expirationDate: new Date().toISOString(),
            endDate: new Date().toISOString(),
            notificationDate: new Date().toISOString(),
            stateComment: "",
            primaryKey: TestUtils.randomIdentifier(10),
            secondaryKey: TestUtils.randomIdentifier(10)
        }
    }

    public getRequestContract(): SmapiSubscriptionContract{
        return {
            properties: {
                displayName: this.displayName,
                createdDate: new Date().toISOString(),
                endDate: new Date().toISOString(),
                expirationDate: new Date().toISOString(),
                notificationDate: new Date().toISOString(),
                primaryKey: TestUtils.randomIdentifier(10),
                scope:  `/products/${this.product.productId}`,
                secondaryKey: TestUtils.randomIdentifier(10),
                startDate: new Date().toISOString(),
                state: "active",
                stateComment: TestUtils.randomIdentifier(10),
                ownerId: `/users/${this.user.publicId}`
            }
        };
    }

    public static getRandomSubscription(testId: string, user: User, product: Product){
        var displayName = TestUtils.randomIdentifier(5);
        var id = TestUtils.randomIdentifier(5);
        return new Subscription(testId, user, product, id, displayName);
    }
}
