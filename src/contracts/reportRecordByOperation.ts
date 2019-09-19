import { ReportRecord } from "./reportRecord";

/**
 * Metrics aggregated by operation.
 */
export interface ReportRecordByOperation extends ReportRecord {
    /**
     * Operation name, e.g. "Get".
     */
    name: string;

    /**
     * Operation identifier, e.g. "/apis/httpbin/operations/get".
     */
    operationId: string;

    /**
     * API identifier, e.g. "/apis/httpbin".
     */
    apiId: string;
}
