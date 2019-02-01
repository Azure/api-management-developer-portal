export class Page<T> {
    public value: T[];
    public count: number;

    public nextPage(): Page<T> {
        throw new Error("Not implemented.")
    }
}