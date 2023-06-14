export const REQUIRED = 'required';
export const UNIQUE_REQUIRED = 'unique-required';
export const URL = 'url';
export const URL_REQUIRED = 'url-required';

export const validateField = (validationType: string, value: string, customValidation?: boolean): string => {
    let isValid: boolean = true;
    let errorMessage: string = '';

    const absoluteUrlRegex = /^(?:https?:\/\/)?(?:[\w-]+\.)*[\w.-]+\.[a-zA-Z]{2,}(?:\/[\w-.~:/?#[\]@!$&'()*+,;=%]*)?$/;
    const relativeUrlRegex = /^(?:\/|#)[\w-.~:/?#[\]@!$&'()*+,;=%]*$/;

    switch (validationType) {
        case REQUIRED:
            isValid = value.length > 0;
            errorMessage = isValid ? '' : 'This field is required';
            break;
        case UNIQUE_REQUIRED:
            isValid = value.length > 0 && customValidation;
            errorMessage = isValid ? '' : 'Field value is required and must be unique';
            break;
        case URL:
            isValid =  value.length === 0 || (absoluteUrlRegex.test(value) || relativeUrlRegex.test(value));
            errorMessage = isValid ? '' : 'Field value should be a valid URL';
            break;
        case URL_REQUIRED:
            isValid = value.length > 0 && (absoluteUrlRegex.test(value) || relativeUrlRegex.test(value));
            errorMessage = isValid ? '' : 'Field value is required and should be a valid URL';
            break;
    }

    return errorMessage;
}