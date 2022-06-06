import { EventManager } from "@paperbits/common/events";
import { ValidationReport } from "../../../contracts/validationReport";
import { MapiError } from "../../../errors/mapiError";
import { ErrorSources, onValidationErrors } from "./constants";

export async function tryCatchDispatchError(
    guardedFunction: () => Promise<unknown>,
    eventManager: EventManager,
    source: ErrorSources,
    fallbackMessage?: string,
    errorDetailsMap: (detail: any) => string = detail => `${detail.message}`
): Promise<string[] | void> {
    dispatchErrors(eventManager, source, []);

    try {
        await guardedFunction();
    } catch (error) {
        return parseAndDispatchError(eventManager, source, error, fallbackMessage, errorDetailsMap);
    }
}

export function parseAndDispatchError(
    eventManager: EventManager,
    source: ErrorSources,
    error: MapiError,
    defaultMessage?: string,
    errorDetailsMap: (detail: any) => string = detail => `${detail.message}`
): string[] {
    let errorDetails: string[];

    if (error.code === "ValidationError" && error.details?.length > 0) {
        errorDetails = error.details.map(errorDetailsMap); // Prioritize errors from the error.details object.
    } else if (error.message) {
        errorDetails = [defaultMessage ?? error.message];
    } else if (typeof error === "string") {
        errorDetails = [defaultMessage ?? error];
    } else {
        errorDetails = []; // No error / clear current errors.
    }

    dispatchErrors(eventManager, source, errorDetails);

    return errorDetails;
}

export function dispatchErrors(eventManager: EventManager, source: ErrorSources, errors: string[]): void {
    dispatchValidationReport(eventManager, {source, errors});
}

export function dispatchValidationReport(eventManager: EventManager, validationReport: ValidationReport): void {
    eventManager.dispatchEvent(onValidationErrors, validationReport);
}
