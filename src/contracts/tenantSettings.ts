export interface TenantSettings {
    "CustomPortalSettings.RegistrationEnabled": boolean;
    "CustomPortalSettings.UserRegistrationTerms": string;
    "CustomPortalSettings.UserRegistrationTermsEnabled": string;
    "CustomPortalSettings.UserRegistrationTermsConsentRequired": string;
    "CustomPortalSettings.DelegationEnabled": string;
    "CustomPortalSettings.DelegationUrl": string;
    "CustomPortalSettings.DelegatedSubscriptionEnabled": string;
    "CustomPortalSettings.DelegationValidationKey": string;
    "CustomPortalSettings.RequireUserSigninEnabled": string;
    userRegistrationTermsEnabled: boolean;
    userRegistrationTerms: string;
    userRegistrationTermsConsentRequired: boolean;
}

export enum DelegationAction {     
    signIn = "SignIn",
    signUp = "SignUp",
    subscribe = "Subscribe",
    unsubscribe = "Unsubscribe",
    renew = "Renew",
    changeProfile = "ChangeProfile",
    changePassword = "ChangePassword",
    closeAccount = "CloseAccount",
    signOut = "SignOut",   
}
  
export enum DelegationParameters { 
    ReturnUrl = "returnUrl",
    ProductId = "productId",
    Operation = "operation",
    Signature = "sig",
    UserId = "userId",
    SubscriptionId = "subscriptionId",
    Salt = "salt"
}
