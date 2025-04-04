export interface SubscriptionContract {
    /**
     * Subscription identifier.
     */
    id: string;

    /**
     * Subscription name.
     */
    name: string;

    /**
     * Subscription creation date.
     */
    createdDate: string;

    /**
     * Date when subscription was cancelled or expired.
     */
    endDate: string;

    /**
     * Subscription expiration date.
     */
    expirationDate: string;

    /**
     * Upcoming subscription expiration notification date.
     */
    notificationDate: string;

    /**
     * Subscription primary key.
     */
    primaryKey: string;

    /**
     * Scope like /products/{productId} or /apis or /apis/{apiId} or /.
     */
    scope: string;

    /**
     * Subscription secondary key.
     */
    secondaryKey: string;

    /**
     * Subscription activation date.
     */
    startDate: string;

    /**
     * Subscription state.
     */
    state: string;

    /**
     * Subscription State Comment.
     */
    stateComment: string;

    /**
     * Owner of the subscription
     */
    ownerId: string;
}

export enum SubscriptionState {
    suspended = "Suspended",
    active = "Active",
    expired = "Expired",
    submitted = "Submitted",
    rejected = "Rejected",
    cancelled = "Cancelled"
}