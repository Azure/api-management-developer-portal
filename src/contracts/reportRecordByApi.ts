import { ReportRecord } from "./reportRecord";

/**
 * Metrics aggregated by API.
 */
export interface ReportRecordByApi extends ReportRecord {
    /**
     * API name, e.g. "HTTP Bin".
     */
    name: string;

    /**
     * API identifier, e.g. "/apis/httpbin".
     */
    apiId: string;
}