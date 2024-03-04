import { EventManager } from "@paperbits/common/events";
import { ValidationReport } from "../../../contracts/validationReport";
import { MapiError } from "../../../errors/mapiError";
import { ErrorSources, onValidationErrors } from "./constants";
import { Logger } from "@paperbits/common/logging";
import { eventTypes } from "../../../logging/clientLogger";

export function parseAndDispatchError(
    eventManager: EventManager,
    source: ErrorSources,
    error: Error,
    logger: Logger,
    defaultMessage?: string,
    errorDetailsMap: (detail: any) => string = detail => `${detail.message}`
): string[] {
    let errorDetails: string[];

    if (error instanceof MapiError && error.code === "ValidationError" && error.details?.length > 0) {
        errorDetails = error.details.map(errorDetailsMap); // Prioritize errors from the error.details object.
    } else if (error.message) {
        errorDetails = [defaultMessage ?? error.message];
    } else if (typeof error === "string") {
        errorDetails = [defaultMessage ?? error];
    } else {
        errorDetails = []; // No error / clear current errors.
    }

    dispatchErrors(eventManager, source, errorDetails);
    logger.trackEvent(eventTypes.userError, { message: `Dispatched error from ${source}: ${error?.message}` });
    return errorDetails;
}

export function dispatchErrors(eventManager: EventManager, source: ErrorSources, errors: string[]): void {
    dispatchValidationReport(eventManager, { source, errors });
}

export function dispatchValidationReport(eventManager: EventManager, validationReport: ValidationReport): void {
    eventManager.dispatchEvent(onValidationErrors, validationReport);
}