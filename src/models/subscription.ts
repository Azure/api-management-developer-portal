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
    public isActive: boolean;

    constructor(contract?: SubscriptionContract) {
        if (!contract) {
            return;
        }

        this.id = contract.id;
        this.name = contract.name || "Unnamed";
        this.createdDate = new Date(contract.createdDate);

        this.endDate = (contract.endDate && new Date(contract.endDate)) || undefined;
        this.expirationDate = (contract.expirationDate && new Date(contract.expirationDate)) || undefined;
        this.notificationDate = (contract.notificationDate && new Date(contract.notificationDate)) || undefined;

        this.primaryKey = contract.primaryKey;
        this.scope = contract.scope;
        this.secondaryKey = contract.secondaryKey;
        this.startDate = (contract.startDate && contract.startDate.split("T")[0]) || undefined;
        this.stateComment = contract.stateComment;
        this.userId = contract.ownerId;

        this.state = SubscriptionState[contract.state];
        this.isExpired = this.state === SubscriptionState.expired;
        this.isAwaitingApproval = this.state === SubscriptionState.submitted;
        this.isActive = this.state === SubscriptionState.active;
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