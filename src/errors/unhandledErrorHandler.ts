import { Logger } from "@paperbits/common/logging";


export class UnhandledErrorHandler {
    constructor(
        private readonly logger: Logger
    ) {
        window.addEventListener("error", this.handlerError.bind(this), true,);
        window.addEventListener("unhandledrejection", this.handlerPromiseRejection.bind(this), true);
    }

    public handlerError(event: ErrorEvent): void {
        this.logger.trackError(event.error);
    }

    public handlerPromiseRejection(event: PromiseRejectionEvent): void {
        this.logger.trackError(event.reason);
    }
}