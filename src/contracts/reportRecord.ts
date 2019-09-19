export interface ReportRecord {
    /**
     * Number of successful calls.
     */
    callCountSuccess: number;

    /**
     * Number of calls blocked due to invalid credentials.
     */
    callCountBlocked: number;

    /**
     * Number of calls failed due to gateway or backend errors.
     */
    callCountFailed: number;

    /**
     * 	Number of calls that didn't fall into any of the previous categories
     */
    callCountOther: number;

    /**
     * Total number of calls during requested period.
     */
    callCountTotal: number;

    /**
     * Total bandwidth consumed (Bytes).
     */
    bandwidth: number;

    /**
     * Number of times content was served from cache.
     */
    cacheHitCount: number;

    /**
     * Number of times content was obtained from the backend.
     */
    cacheMissCount: number;

    /**
     * Average time it took to process a request.
     */
    apiTimeAvg: number;

    /**
     * Minimum time it took to process a request.
     */
    apiTimeMin: number;

    /**
     * 	Maximum time it took to process a request.
     */
    apiTimeMax: number;

    /**
     * Average time it took to process a request on the backend.
     */
    serviceTimeAvg: number;

    /**
     * Minimum time it took to process a request on the backend.
     */
    serviceTimeMin: number;

    /**
     * Maximum time it took to process a request on the backend.
     */
    serviceTimeMax: number;
}