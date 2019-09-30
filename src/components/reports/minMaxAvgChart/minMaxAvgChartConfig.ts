import { MinMaxAvgChartRecord } from "./minMaxAvgChartRecord";

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