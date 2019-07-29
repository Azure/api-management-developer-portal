export class Page<T> {
    public value: T[];
    public count: number;
    public nextLink?: string;

    constructor() {
        this.value = [];
        this.count = 0;
        this.nextLink = null;
    }

    public getSkip(): string {
        if (!this.nextLink) {
            return undefined;
        }

        const url = new URL(this.nextLink);
        const queryParams = new URLSearchParams(decodeURIComponent(url.search));

        if (queryParams.has("$skip")) {
            return queryParams.get("$skip");
        }
    }
}