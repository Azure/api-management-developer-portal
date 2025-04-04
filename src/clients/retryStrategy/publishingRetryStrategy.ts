import { Logger } from "@paperbits/common/logging";
import { IRetryStrategy } from "./retryStrategy";

export class PublishingRetryStrategy implements IRetryStrategy {
    private readonly attemptsCount = 3;

    constructor(private readonly logger: Logger) { }

    public async invokeCall<T>(call: any): Promise<T> {
        let currentAttempt: number = 0;
        while (currentAttempt < this.attemptsCount) {
            let result: any;

            try {
                result = await call();
            } catch (ex) {
                currentAttempt++;

                if (currentAttempt < this.attemptsCount) {
                    this.logger.trackEvent("ApiClient", {
                        message: `Error during attempt: ${currentAttempt}, for api call: ${ex.message}`
                    });

                    continue;
                }

                throw ex;
            }

            return result;
        }
    }
}