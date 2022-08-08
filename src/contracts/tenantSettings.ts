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

export const DelegationActionPath  = {     
    SignIn: "signin",
    SignUp: "signup",
    Subscribe: "delegation-subscribe",
    Unsubscribe: "delegation-unsubscribe",
    Renew: "delegation-renew",
    ChangeProfile: "delegation-changeProfile",
    ChangePassword: "change-password",
    CloseAccount: "delegation-closeAccount",
    SignOut: "signout"
}

export enum DelegationAction {     
    signIn = "SignIn",
    signUp = "SignUp",
    signOut = "SignOut",
    subscribe = "Subscribe",
    unsubscribe = "Unsubscribe",
    changeProfile = "ChangeProfile",
    //[SuppressMessage("Microsoft.Security", "CS002:SecretInNextLine", Justification="False positive")]
    changePassword = "ChangePassword",
    closeAccount = "CloseAccount",
    renew = "Renew"
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
