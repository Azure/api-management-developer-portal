import { Logger } from "@paperbits/common/logging";
import * as ko from "knockout";
import { eventTypes } from "../logging/clientLogger";

export class TraceClick {
    constructor(private readonly logger: Logger) { }

    public setupBinding(): void {
        ko.bindingHandlers["traceClick"] = {
            init: (element: HTMLElement): void => {
                ko.utils.registerEventHandler(element, "click", () => {
                    this.logger.trackEvent(eventTypes.click, { message: `User clicked on the element with id ${element.id ?? "-"}` });
                });
            }
        }
    }
}