 /**
  * Map-chart record.
  */
export interface MapChartRecord {
    /**
     * Three-letter ISO country code, e.g. "USA".
     * @see https://www.iso.org/obp/ui
     */
    countryCode: string;

    /**
     * Heat value.
     */
    heat: number;
}

