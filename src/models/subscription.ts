import { SubscriptionContract, SubscriptionState } from "../contracts/subscription";
import { Utils } from "../utils";

export class Subscription {
    public id: string;
    public name: string;
    public createdDate: Date;
    public endDate?: Date;
    public expirationDate?: Date;
    public notificationDate?: Date;
    public primaryKey: string;
    public scope: string;
    public productName?: string;
    public secondaryKey: string;
    public startDate: string;
    public state: SubscriptionState;
    public stateComment: string;
    public userId: string;
    public isExpired: boolean;
    public isAwaitingApproval: boolean;
    public isRejected: boolean;

    constructor(contract?: SubscriptionContract) {
        this.id = Utils.getResourceName("users", contract.id, "shortId");
        this.name = contract.properties.displayName || "Unnamed";
        this.createdDate = new Date(contract.properties.createdDate);

        this.endDate = (contract.properties.endDate && new Date(contract.properties.endDate)) || undefined;
        this.expirationDate = (contract.properties.expirationDate && new Date(contract.properties.expirationDate)) || undefined;
        this.notificationDate = (contract.properties.notificationDate && new Date(contract.properties.notificationDate)) || undefined;

        this.primaryKey = contract.properties.primaryKey;
        this.scope = contract.properties.scope;
        this.secondaryKey = contract.properties.secondaryKey;
        this.startDate = (contract.properties.startDate && contract.properties.startDate.split("T")[0]) || undefined;
        this.stateComment = contract.properties.stateComment;
        this.userId = Utils.getResourceName("users", contract.properties.ownerId, "shortId");

        this.state = SubscriptionState[contract.properties.state];
        this.isExpired = this.state === SubscriptionState.expired;
        this.isAwaitingApproval = this.state === SubscriptionState.submitted;
        this.isRejected = this.state === SubscriptionState.rejected;
    }

    public canBeRenewed(): boolean {
        if (this.state !== SubscriptionState.active) {
            return false;
        }

        if (!this.notificationDate || !this.expirationDate) {
            return false;
        }

        const current = new Date().getTime();

        return current >= this.notificationDate.getTime() && current < this.expirationDate.getTime();
    }

    public canBeCancelled(): boolean {
        return this.state === SubscriptionState.active || this.state === SubscriptionState.submitted;
    }
}