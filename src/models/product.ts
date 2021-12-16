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
        this.displayName = contract.properties.displayName;
        this.description = contract.properties.description;
        this.approvalRequired = contract.properties.approvalRequired;
        this.state = contract.properties.state;
        this.subscriptionRequired = contract.properties.subscriptionRequired;
        this.subscriptionsLimit = contract.properties.subscriptionsLimit;
        this.terms = contract.properties.terms;
    }
}