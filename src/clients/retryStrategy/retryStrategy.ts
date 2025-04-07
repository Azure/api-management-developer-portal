export interface IRetryStrategy {
    invokeCall<T>(call: any): Promise<T>;
}