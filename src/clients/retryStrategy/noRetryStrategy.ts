import { IRetryStrategy } from "./retryStrategy";

export class NoRetryStrategy implements IRetryStrategy {
    public invokeCall<T>(call: any): Promise<T> {
        return call();
    }
}