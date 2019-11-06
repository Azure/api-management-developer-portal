import { Bag } from "@paperbits/common";

/**
 * Bar-chart record.
 */
export interface BarChartRecord {
    /**
     * Time stamp of the record used to build X-axis.
     */
    timestamp: Date;

    /**
     * Data sample values used to build Y-axis.
     */
    value: Bag<number>;
}

/**
 * Dimension of the bar-chart used to build Y-axis and chart legend.
 */
 export interface BarChartDimension {
     /**
      * Dimension display name, e.g. "Total requests".
      */
     displayName: string;

     /**
      * Key of the property in record, e.g. "callCountTotal".
      */
     key: string;

     /**
      * Dimension color used in chart legend.
      */
     color: string;
 }

 /**
  * Bar-chart configuration.
  */
export interface BarChartConfig {
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
    records: BarChartRecord[];

    /**
     *  Chart dimensions of used to build Y-axis and legend.
     */
    dimensions: BarChartDimension[];

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