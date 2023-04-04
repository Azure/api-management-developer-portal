import { Logger } from "@paperbits/common/logging";


export class UnhandledErrorHandler {
    constructor(private readonly logger: Logger) {
        window.addEventListener("error", this.handlerError.bind(this), true,);
        window.addEventListener("unhandledrejection", this.handlerPromiseRejection.bind(this), true);
    }

    public handlerError(event: ErrorEvent): void {
        try {
            this.logger.trackError(event.error);
        } catch (error) {
            console.error(`Unable to log event.error: ${event.error} - Error:`, error);
        }
    }

    public handlerPromiseRejection(event: PromiseRejectionEvent): void {
        try {
            this.logger.trackError(event.reason);
        } catch (error) {
            console.error(`Unable to log Promise Rejection event.reason: ${event.reason} - Error:`, error);
        }
    }
}