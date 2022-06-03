import { EventManager } from "@paperbits/common/events";
import { ValidationReport } from "../../../contracts/validationReport";

export const onValidationErrors = "onValidationErrors";

export enum errorSources {
    signin = "signin",
    signup = "signup",
    socialAcc = "socialAcc",
    signInOAuth = "signInOAuth",
    confirmpassword = "confirmpassword",
    changepassword = "changepassword",
    resetpassword = "resetpassword",
    changeProfile = "changeProfile",
    renameSubscription = "renameSubscription",
    regeneratePKey = "regeneratePKey",
}

export async function tryCatchDispatchError(
    guardedFunction: () => Promise<unknown>,
    eventManager: EventManager,
    source: errorSources,
    fallbackMessage?: string,
    errorDetailsMap: (detail: any) => string = detail => `${detail.message}`
): Promise<void> {
    parseAndDispatchError(eventManager, source, [], fallbackMessage, errorDetailsMap);

    try {
        await guardedFunction();
    } catch (error) {
        parseAndDispatchError(eventManager, source, error, fallbackMessage, errorDetailsMap);
    }
}

export function parseAndDispatchError(
    eventManager: EventManager,
    source: errorSources,
    error: Record<string, any>,
    fallbackMessage?: string,
    errorDetailsMap: (detail: any) => string = detail => `${detail.message}`
): string[] {
    let errorDetails: string[];

    if (error.code === "ValidationError") {
        errorDetails = error.details?.map(errorDetailsMap) || [fallbackMessage ?? error.message];
    } else {
        errorDetails = [fallbackMessage ?? error.message];
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
