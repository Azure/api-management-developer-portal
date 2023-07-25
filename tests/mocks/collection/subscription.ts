import { SubscriptionContract } from "../../../src/contracts/subscription";
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

    public getResponseContract(): any{
        return {
            id: `/subscriptions/sid/resourceGroups/rgid/providers/Microsoft.ApiManagement/service/sid/users/${this.user.publicId}/subscriptions/${this.id}`,
            type: "Microsoft.ApiManagement/service/users/subscriptions",
            name: this.id,
            properties: {
                ownerId: `/subscriptions/sid/resourceGroups/rgid/providers/Microsoft.ApiManagement/service/sid/users/${this.user.publicId}`,
                scope: `/subscriptions/sid/resourceGroups/rgid/providers/Microsoft.ApiManagement/service/sid/products/${this.product.productId}`,
                displayName: this.displayName,
                state: "active",
                createdDate: new Date().toISOString(),
                startDate: new Date().toISOString(),
                expirationDate: new Date().toISOString(),
                endDate: null,
                notificationDate: new Date().toISOString(),
                stateComment: null,
            }
        }
    }

    public getContract(): SubscriptionContract{
        return {
            properties: {
                displayName: this.displayName,
                createdDate: new Date().toISOString(),
                endDate: new Date().toISOString(),
                expirationDate: new Date().toISOString(),
                notificationDate: new Date().toISOString(),
                primaryKey: TestUtils.randomIdentifier(10),
                scope: TestUtils.randomIdentifier(5),
                secondaryKey: TestUtils.randomIdentifier(10),
                startDate: new Date().toISOString(),
                state: "active",
                stateComment: TestUtils.randomIdentifier(10),
                ownerId: TestUtils.randomIdentifier(5)
            }
        };
    }

    public static getRandomSubscription(testId: string, user: User, product: Product){
        var displayName = TestUtils.randomIdentifier(5);
        var id = TestUtils.randomIdentifier(5);
        return new Subscription(testId, user, product, id, displayName);
    }
}
