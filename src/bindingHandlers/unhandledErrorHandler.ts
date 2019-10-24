import { Router } from "@paperbits/common/routing";
import { Logger } from "@paperbits/common/logging";
import { pageUrl500 } from "./../constants";

export class UnhandledErrorHandler {
    constructor(
        private readonly logger: Logger,
        private readonly router: Router
    ) {
        window.addEventListener("error", this.handlerError.bind(this), false);
    }

    public handlerError(event: ErrorEvent): void {
        this.logger.traceError(event.error);
        this.router.navigateTo(pageUrl500);
    }
}