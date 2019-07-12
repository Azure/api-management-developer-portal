import { ArmResource } from "./armResource";

export interface ProductContract extends ArmResource {
    properties: {
        displayName: string;
        description: string;
        approvalRequired: boolean;
        state: string;
        subscriptionRequired: boolean;
        subscriptionsLimit: number;
        terms: string;
    };
}