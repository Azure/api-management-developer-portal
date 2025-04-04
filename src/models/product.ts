import { ProductContract, ProductState } from "../contracts/product";

export class Product {
    public readonly id: string;
    public readonly name: string;
    public readonly displayName: string;
    public readonly description: string;
    public readonly approvalRequired: boolean;
    public readonly state: ProductState;
    public readonly subscriptionRequired: boolean;
    public readonly subscriptionsLimit?: number;
    public readonly terms: string;

    constructor(contract?: ProductContract) {
        if (!contract) {
            return;
        }

        this.id = contract.id;
        this.name = contract.id;
        this.displayName = contract.name;
        this.description = contract.description;
        this.approvalRequired = contract.approvalRequired;
        this.subscriptionRequired = contract.subscriptionRequired;
        this.subscriptionsLimit = contract.subscriptionsLimit;
        this.terms = contract.terms;
    }
}