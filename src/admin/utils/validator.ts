export const REQUIRED = 'required';
export const CW_NAME = 'custom-widget-name';

export const validateField = (validationType: string, value: string, customValidation?: boolean): string => {
    let isValid: boolean = true;
    let errorMessage: string = '';

    switch (validationType) {
        case REQUIRED:
            isValid = value.length > 0;
            errorMessage = isValid ? '' : 'This field is required';
        case CW_NAME:
            isValid = value.length > 0 && customValidation;
            errorMessage = isValid ? '' : `Custom widget's name is required and must be unique`;
    }

    return errorMessage;
}