import { ViewManager } from "@paperbits/common/ui";
import { EventManager } from "@paperbits/common/events";


export class SessionExpirationErrorHandler {
    constructor(private readonly viewManager: ViewManager, eventManager: EventManager) {
        eventManager.addEventListener("error", this.handlerError.bind(this));
        window.addEventListener("unhandledrejection", this.handlerPromiseRejection.bind(this), true);
    }

    private handleSessionExpiration(error: Error): void {
        if (!error.message?.includes("Unauthorized request.")) {
            return;
        }

        event.preventDefault();
        event.stopImmediatePropagation();
        this.viewManager.hideToolboxes();
        this.viewManager.addToast("Session expired", `Please re-authenticate through Azure portal.`);
        this.viewManager.setShutter();
        return;
    }

    public handlerError(event: ErrorEvent): void {
        this.handleSessionExpiration(event.error);
    }

    public handlerPromiseRejection(event: PromiseRejectionEvent): void {
        this.handleSessionExpiration(event.reason);
    }
}