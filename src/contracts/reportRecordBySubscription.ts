import { ReportRecord } from "./reportRecord";

/**
 * Metrics aggregated by product subscription.
 */
export interface ReportRecordBySubscription extends ReportRecord {
    /**
     * Subscription name, e.g. "My subscription".
     */
    name: string;

    /**
     * Product identifier, e.g. "/products/unlimited".
     */
    productId: string;

    /**
     * Subscription identifier, e.g. "/subscriptions/my-subscription"
     */
    subscriptionId: string;

    /**
     * User identifier, e.g. "/users/john-doe"
     */
    userId: string;
}