import { ProductContract } from "../contracts/product";

export class Product {
    public id: string;
    public name: string;
    public description: string;
    public approvalRequired: boolean;
    public state: string;
    public subscriptionRequired: boolean;
    public subscriptionsLimit?: number;
    public terms: string;
    public allowMultipleSubscriptions: boolean;

    constructor(contract?: ProductContract) {
        this.id = contract.id;
        this.name = contract.name;
        this.description = contract.description;
        this.approvalRequired = contract.approvalRequired;
        this.state = contract.state;
        this.subscriptionRequired = contract.subscriptionRequired;
        this.subscriptionsLimit = contract.subscriptionsLimit;
        this.terms = contract.terms;

        this.allowMultipleSubscriptions = !contract.subscriptionsLimit || contract.subscriptionsLimit > 1;
    }
}