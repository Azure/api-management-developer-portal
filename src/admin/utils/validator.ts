export const REQUIRED = "required";
export const UNIQUE_REQUIRED = "unique-required";
export const URL = "url";
export const URL_REQUIRED = "url-required";

export const REQUIRED_MESSAGE = "This field is required";
export const UNIQUE_REQUIRED_MESSAGE = "Field value is required and must be unique";
export const URL_MESSAGE = "Field value should be a valid URL";
export const URL_REQUIRED_MESSAGE = "Field value is required and should be a valid URL";

export const validateField = (validationType: string, value: string, customValidation?: boolean): string => {
    if (value === undefined) return;

    let isValid: boolean = true;
    let errorMessage: string = "";

    const absoluteUrlRegex = /^(?:https?:\/\/)?(?:[\w-]+\.)*[\w.-]+\.[a-zA-Z]{2,}(?:\/[\w-.~:/?#[\]@!$&'()*+,;=%]*)?$/;
    const relativeUrlRegex = /^(?:\/|#)[\w-.~:/?#[\]@!$&'()*+,;=%]*$/;
    const isNotEmpty = value.length > 0 && value.trim().length > 0;

    switch (validationType) {
        case REQUIRED:
            isValid = isNotEmpty;
            errorMessage = isValid ? "" : REQUIRED_MESSAGE;
            break;
        case UNIQUE_REQUIRED:
            isValid = isNotEmpty && (customValidation === true);
            errorMessage = isValid ? "" : UNIQUE_REQUIRED_MESSAGE;
            break;
        case URL:
            isValid = value.length === 0 || (absoluteUrlRegex.test(value) || relativeUrlRegex.test(value));
            errorMessage = isValid ? "" : URL_MESSAGE;
            break;
        case URL_REQUIRED:
            isValid = isNotEmpty && (absoluteUrlRegex.test(value) || relativeUrlRegex.test(value));
            errorMessage = isValid ? "" : URL_REQUIRED_MESSAGE;
            break;
    }

    return errorMessage;
}