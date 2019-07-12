export class Page<T> {
    public value: T[];
    public count: number;
    public nextLink?: string;

    public getSkip(): string {
        if (this.nextLink) {
            const url = new URL(this.nextLink);
            const queryParams = new URLSearchParams(decodeURIComponent(url.search));
            if (queryParams.has("$skip")) {
                return queryParams.get("$skip");
            }
        }
        return undefined;
    }
}