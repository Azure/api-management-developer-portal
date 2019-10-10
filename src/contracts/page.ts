export interface PageContract<T> {
    value: T[];
    count: number;
    nextLink?: string;
}