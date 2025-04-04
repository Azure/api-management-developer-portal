export class ValidationMessages {
    static captchaNotInitialized = `Unable to validate entered characters due to internal errors. Try to refresh the page and repeat the operation.`;
    static emailRequired = `Email is required.`;
    static captchaRequired = `Captcha is required.`;
    static firstNameRequired = `First name is required.`;
    static lastNameRequired = `Last name is required.`;
    static passwordRequired = `Password is required.`;
    static passwordCriteria = `Passwords must have at least 8 characters and contain at least two of the following: uppercase letters, lowercase letters, numbers, and symbols`;
    static passwordConfirmationMustMatch = `Password confirmation field must be equal to password.`;
    static newPasswordRequired = `New password is required.`;
    static newPasswordMustBeDifferent = `New password must be different from your old password.`;
    static consentRequired = `You must agree to the terms of use.`;
    static subscriptionNameRequired = `Subscription name is required.`;
}