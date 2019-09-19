import { ReportRecord } from "./reportRecord";

/**
 * Metrics aggregated over a period of time.
 */
export interface ReportRecordByTime extends ReportRecord {
    /**
     * e.g. "2019-09-05T19:30:00Z"
     */
    timestamp: string;

    /**
     * Interval must be multiple of 15 minutes and may not be zero, e.g. "PT15M"
     */
    interval: string;
}