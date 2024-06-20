import { ArmResource } from "./armResource";

export type ProductState = "published" | "notPublished";

export interface ProductContract extends ArmResource {
    properties: {
        displayName: string;
        description: string;
        approvalRequired: boolean;
        state: ProductState;
        subscriptionRequired: boolean;
        subscriptionsLimit: number;
        terms: string;
    };
}