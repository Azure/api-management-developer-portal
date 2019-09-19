import { ReportRecord } from "./reportRecord";

/**
 * Metrics aggregated by geographical region.
 */
export interface ReportRecordByGeo extends ReportRecord {
    /**
     * e.g. "US"
     */
    country: string;

    /**
     * e.g. "CA"
     */
    region: string;

    /**
     * e.g. 98065
     */
    zip: number;
}