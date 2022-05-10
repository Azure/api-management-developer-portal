import { ArmResource } from "./armResource";

export interface ProductContract {
    id: string;
    name: string;
    description: string;
    approvalRequired: boolean;
    subscriptionRequired: boolean;
    subscriptionsLimit: number;
    terms: string;
}