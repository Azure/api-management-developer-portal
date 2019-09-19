/**
 * Query object used for making queries to Analtics service.
 */
export interface ReportQuery {
    /**
     * Report start time.
     */
    startTime: Date;

    /**
     * Report end time.
     */
    endTime: Date;

    /**
     * Amount of records to skip.
     */
    skip?: number;

    /**
     * Amount of records to take.
     */
    take?: number;

    /**
     * A field the report needs to be order by.
     */
    orderBy?: string;

    /**
     * Order direction.
     */
    orderDirection?: string;
}