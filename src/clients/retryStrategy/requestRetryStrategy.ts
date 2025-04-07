import { Logger } from "@paperbits/common/logging";
import { IRetryStrategy } from "./retryStrategy";
import { MapiError, MapiErrorCodes } from "../../errors/mapiError";

const RetryHeader = "retry-after";
const AllRetryAfterHeaders: string[] = ["retry-after-ms", "x-ms-retry-after-ms", RetryHeader];

export class RequestRetryStrategy implements IRetryStrategy {

    defaultDelayMs: number = 500;
    maxRetries: number = 3;

    constructor(
        private readonly logger: Logger) { }

    // get the delay in milliseconds for the next request attempt based on an error
    private getDelay(error: MapiError): number {
        let delayMs = this.defaultDelayMs;
        switch (error.code) {
            case MapiErrorCodes.TooManyRequest:
                if (error.details) {
                    const retryAfterHeader = error.details.find(h => {
                        return AllRetryAfterHeaders.indexOf(h.message.toLowerCase()) >= 0
                    });
                    const retryAfterValue = parseInt(retryAfterHeader?.target);
                    if (!isNaN(retryAfterValue)) {
                        let multiplyingFactor = 1;
                        // "Retry-After" header ==> seconds
                        // "retry-after-ms", "x-ms-retry-after-ms" headers ==> milliseconds
                        if (retryAfterHeader.message.toLowerCase() === RetryHeader) {
                            multiplyingFactor = 1000;
                        }
                        delayMs = retryAfterValue * multiplyingFactor; // in milli-seconds
                    }
                }
                return delayMs;
            case MapiErrorCodes.ServerError:
            case MapiErrorCodes.Unhandled:
            default:
                return this.defaultDelayMs;
        }
    }

    private shouldRetry(error: MapiError) {
        switch (error.code) {
            case MapiErrorCodes.TooManyRequest:
            case MapiErrorCodes.ServerError:
            case MapiErrorCodes.Unhandled:
                return true;
            default:
                return false;
        }
    }

    public async invokeCall<T>(call: any): Promise<T> {
        let attempt = 0;
        let response;
        while (attempt < this.maxRetries) {
            try {
                response = await call();
                break;
            } catch (error) {
                if (error instanceof MapiError && this.shouldRetry(error)) {
                    const delayMs = this.getDelay(error);
                    this.logger.trackEvent("RequestRetryStrategy", { message: `Received status 429. Retrying in ${delayMs} ms.` });
                    // introduce a delay before the next retry
                    await this.sleep(delayMs);
                    attempt++;
                } else {
                    this.logger.trackEvent("RequestRetryStrategy", { message: `Error during request: ${error.message}` });
                    throw error;
                }
            }
        }
        return response;
    }

    public async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
