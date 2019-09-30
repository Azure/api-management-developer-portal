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
