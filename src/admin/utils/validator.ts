export const REQUIRED = 'required';
export const CW_NAME = 'custom-widget-name';
export const URL = 'url';

export const validateField = (validationType: string, value: string, customValidation?: boolean): string => {
    let isValid: boolean = true;
    let errorMessage: string = '';

    switch (validationType) {
        case REQUIRED:
            isValid = value.length > 0;
            errorMessage = isValid ? '' : 'This field is required';
            break;
        case CW_NAME:
            isValid = value.length > 0 && customValidation;
            errorMessage = isValid ? '' : `Custom widget's name is required and must be unique`;
            break;
        case URL:
            const absoluteUrlRegex = /^(?:https?:\/\/)?(?:[\w-]+\.)*[\w.-]+\.[a-zA-Z]{2,}(?:\/[\w-.~:/?#[\]@!$&'()*+,;=%]*)?$/;
            const relativeUrlRegex = /^(?:\/|#)[\w-.~:/?#[\]@!$&'()*+,;=%]*$/;
            isValid = value.length > 0 && (absoluteUrlRegex.test(value) || relativeUrlRegex.test(value));
            errorMessage = isValid ? '' : 'URL is required and should be a valid URL';
            break;
    }

    return errorMessage;
}