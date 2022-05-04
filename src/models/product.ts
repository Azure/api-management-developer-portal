import { ProductContract } from "../contracts/product";
import { Utils } from "../utils";

export class Product {
    public readonly id: string;
    public readonly name: string;
    public readonly displayName: string;
    public readonly description: string;
    public readonly approvalRequired: boolean;
    public readonly state: string;
    public readonly subscriptionRequired: boolean;
    public readonly subscriptionsLimit?: number;
    public readonly terms: string;

    constructor(contract?: ProductContract) {
        this.id = Utils.getResourceName("products", contract.id, "shortId");
        this.name = contract.name;
        this.displayName = contract.name;
        this.description = contract.description;
        this.approvalRequired = contract.approvalRequired;
        this.state = contract.state;
        this.subscriptionRequired = contract.subscriptionRequired;
        this.subscriptionsLimit = contract.subscriptionsLimit;
        this.terms = contract.terms;
    }
}