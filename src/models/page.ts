export class Page<T> {
    /**
     * Collection of items on the page.
     */
    public value: T[];

    /**
     * Number of items in the page.
     */
    public count: number;

    /**
     * A link to the next page of the query result.
     */
    public nextLink?: string; // TODO: Implement .next() instead of link.

    constructor() {
        this.value = [];
        this.count = 0;
        this.nextLink = null;
    }

    public getSkip(): number {
        if (!this.nextLink) {
            return undefined;
        }

        const url = new URL(this.nextLink);
        const queryParams = new URLSearchParams(decodeURIComponent(url.search));

        if (queryParams.has("$skip")) {
            return parseInt(queryParams.get("$skip"));
        }
    }
}