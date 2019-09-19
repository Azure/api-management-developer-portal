/**
 * Min-max-avg-chart record.
 */
export interface MinMaxAvgChartRecord {
    /**
     * Time stamp of the record used to build X-axis.
     */
    timestamp: Date;

    /**
     * Min value used to build Y-axis.
     */
    min: number;

    /**
     * Avg value used to build Y-axis.
     */
    avg: number;

    /**
     * Max value used to build Y-axis.
     */
    max: number;
}


 /**
  * Min-max-avg-chart configuration.
  */
export interface MinMaxAvgChartConfig {
    /**
     * Start of reporting period.
     */
    startTime: Date;

    /**
     * End of reporting period.
     */
    endTime: Date;

    /**
     * Collection of data records.
     */
    records: MinMaxAvgChartRecord[];

    /**
     * Function providing formatted value for Y-axis. If undefined, original value is used.
     */
    formatX?: (value: Date) => string;

    /**
     * Function providing detailed formatted value for X-axis. If undefined, original value is used.
     */
    formatXDetailed?: (value: Date) => string;

    /**
     * Function providing formatted value for Y-axis. If undefined, original value is used.
     */
    formatY?: (value: number) => string;

    /**
     * Function providing detailed formatted value for Y-axis. If undefined, original value is used.
     */
    formatYDetailed?: (value: Date) => string;
}