import { ProductContract } from "../contracts/product";
import { Utils } from "../utils";

export class Product {
    public id: string;
    public name: string;
    public displayName: string;
    public description: string;
    public approvalRequired: boolean;
    public state: string;
    public subscriptionRequired: boolean;
    public subscriptionsLimit?: number;
    public terms: string;

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