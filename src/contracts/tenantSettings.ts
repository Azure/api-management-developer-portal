export interface TenantSettings {
    ManagementServiceUrl: string;
    PublicManagementServiceUrl: string;
    KuduUrl: string;
    ProxyHostName: string;
    CdnHostName: string;
    PortalStorageConnectionString: string;
    PublisherKey: string;
    TenantSymmetricKey: string;
    EnableProfilerDump: string;
    SenderName: string;
    SenderEmail: string;
    PortalHostName: string;
    "IdentityConfig.TrustedAudienceUri": string;
    "IdentityConfig.TrustedIssuer": string;
    "IdentityConfig.ServiceKey": string;
    "IdentityConfig.ServiceKey.ServiceName": string;
    "CustomPortalSettings.RegistrationEnabled": boolean;
    "CustomPortalSettings.UserRegistrationTerms": string;
    "CustomPortalSettings.UserRegistrationTermsEnabled": string;
    "CustomPortalSettings.UserRegistrationTermsConsentRequired": string;
    "CustomPortalSettings.DelegationEnabled": string;
    "CustomPortalSettings.DelegationUrl": string;
    "CustomPortalSettings.DelegatedSubscriptionEnabled": string;
    "CustomPortalSettings.DelegationValidationKey": string;
    "CustomPortalSettings.RequireUserSigninEnabled": string;
    "CustomPortalSettings.UserSigninEnabled": string;
    userRegistrationTermsEnabled: boolean;
    userRegistrationTerms: string;
    userRegistrationTermsConsentRequired: boolean;
    requireUserSigninEnabled: boolean;
}

export enum DelegationAction {     
    signIn = "SignIn",
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
