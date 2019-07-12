import { ArmResource } from "./armResource";


export interface SubscriptionContract extends ArmResource {
    properties: {
        displayName: string;
        createdDate: string;
        endDate: string;
        expirationDate: string;
        notificationDate: string;
        primaryKey: string;
        scope: string;
        secondaryKey: string;
        startDate: string;
        state: string;
        stateComment: string;
        ownerId: string;
    }
}

export enum SubscriptionState {
    suspended = "suspended",
    active = "active",
    expired = "expired",
    submitted = "submitted",
    rejected = "rejected",
    cancelled = "cancelled"
}