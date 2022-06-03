import { EventManager } from "@paperbits/common/events";
import { ValidationReport } from "../../../contracts/validationReport";

export const onValidationErrors = "onValidationErrors";

export enum errorSources {
    signin = "signin",
    signup = "signup",
    signInOAuth = "signInOAuth",
    confirmpassword = "confirmpassword",
    changepassword = "changepassword",
    resetpassword = "resetpassword",
    changeProfile = "changeProfile",
    renameSubscription = "renameSubscription",
    cancelSubscription = "cancelSubscription",
    regeneratePKey = "regeneratePKey",
    regenerateSKey = "regenerateSKey",
}

export async function tryCatchDispatchError(
    guardedFunction: () => Promise<unknown>,
    eventManager: EventManager,
    source: errorSources,
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
    source: errorSources,
    error: Record<string, any>,
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

export function dispatchErrors(eventManager: EventManager, source: errorSources, errors: string[]): void {
    dispatchValidationReport(eventManager, {source, errors});
}

export function dispatchValidationReport(eventManager: EventManager, validationReport: ValidationReport): void {
    eventManager.dispatchEvent(onValidationErrors, validationReport);
}
