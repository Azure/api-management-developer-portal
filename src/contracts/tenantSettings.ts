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

export enum DelegationActionPath {     
    signIn = "signin",
    signUp = "signup",
    subscribe = "delegation-subscribe",
    unsubscribe = "delegation-unsubscribe",
    renew = "delegation-renew",
    changeProfile = "delegation-changeProfile",
    changePassword = "change-password",
    closeAccount = "delegation-closeAccount",
    signOut = "signout"
}

export enum DelegationAction {     
    signIn = "SignIn",
    signUp = "SignUp",
    signOut = "SignOut"
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
