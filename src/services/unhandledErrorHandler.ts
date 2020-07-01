import { Router } from "@paperbits/common/routing";
import { Logger } from "@paperbits/common/logging";
import { pageUrl500 } from "../constants";

export class UnhandledErrorHandler {
    constructor(
        private readonly logger: Logger,
        private readonly router: Router
    ) {
        window.addEventListener("error", this.handlerError.bind(this), true);
        window.addEventListener("unhandledrejection", this.handlerPromiseRejection.bind(this), true);
    }

    public handlerError(event: ErrorEvent): void {
        this.logger.traceError(event.error);
    }

    public handlerPromiseRejection(event: PromiseRejectionEvent): void {
        this.logger.traceError(event.reason);
    }
}