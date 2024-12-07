export interface Page<T> {
    /**
     * Collection of items on the page.
     */
    value: T[];

    /**
     * Number of items in the page.
     */
    count: number;

    /**
     * A link to the next page of the query result.
     */
    nextLink?: string;
}