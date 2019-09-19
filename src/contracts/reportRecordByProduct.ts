import { ReportRecord } from "./reportRecord";

/**
 * Metrics aggregated by product.
 */
export interface ReportRecordByProduct extends ReportRecord {
    /**
     * Product name, e.g. "Starter".
     */
    name: string;

    /**
     * Product unique identifier, e.g. "/products/starter"
     */
    productId: string;
}