import { MapChartRecord } from "./mapChartRecord";

/**
 * Map chart configuration.
 */
export interface MapChartConfig {
    records: MapChartRecord[];
    formatHeat?: (value: number) => string;
}
