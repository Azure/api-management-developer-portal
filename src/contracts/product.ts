import { ArmResource } from "./armResource";

export interface ProductContract {
    id: string;
    name: string;
    description: string;
    approvalRequired: boolean;
    state: string;
    subscriptionRequired: boolean;
    subscriptionsLimit: number;
    terms: string;
}