import { IApiClient } from "../clients";
import { DelegationAction, DelegationActionPath, DelegationParameters } from "../contracts/tenantSettings";
import { DeveloperPortalType, SettingNames } from "../constants";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { DelegationSettings } from "../contracts/delegationSettings";
import { IDelegationService, DelegationResponse, UserDelegationResponse } from "./IDelegationService";
import { Bag } from "@paperbits/common";

export class DelegationService implements IDelegationService {
    private developerPortalType: string;

    constructor(
        private readonly apiClient: IApiClient,
        private readonly settingsProvider: ISettingsProvider) { }

    private async getDelegationSettings(): Promise<DelegationSettings> {
        return await this.apiClient.get(`/delegation/settings`);
    }

    public async isUserRegistrationDelegationEnabled(): Promise<boolean> {
        const delegationSettings = await this.getDelegationSettings();
        return delegationSettings?.signin;
    }

    public async isSubscriptionDelegationEnabled(): Promise<boolean> {
        const delegationSettings = await this.getDelegationSettings();
        return delegationSettings?.subscribe
    }

    public async getDelegatedSigninUrl(returnUrl: string): Promise<string> {
        const payload = {
            [DelegationParameters.ReturnUrl]: returnUrl
        }
        const response = await this.apiClient.post<DelegationResponse>("/delegation/urls/signin", null, JSON.stringify(payload));
        return response.ssoUrl;
    }

    public async getDelegatedSignupUrl(returnUrl: string): Promise<string> {
        const payload = {
            [DelegationParameters.ReturnUrl]: returnUrl
        }
        const response = await this.apiClient.post<DelegationResponse>("/delegation/urls/signup", null, JSON.stringify(payload));
        return response.ssoUrl;
    }

    public async getUserDelegationUrl(userId: string, action: DelegationAction, delegationParameters: Bag<string>): Promise<string> {
        if (!this.developerPortalType) {
            const settings = await this.settingsProvider.getSettings();
            this.developerPortalType = settings[SettingNames.developerPortalType] || DeveloperPortalType.selfHosted;
        }

        if (this.developerPortalType === DeveloperPortalType.managed) {
            const queryParams = new URLSearchParams();
            Object.keys(delegationParameters).map(key => {
                const val = delegationParameters[key];
                if (val) {
                    queryParams.append(key, val);
                }
            });
            return `/${DelegationActionPath[action]}?${queryParams.toString()}`;
        }
        else {
            const response = await this.apiClient.post<UserDelegationResponse>(`/delegation/urls/users/${userId}/${action}`, null, JSON.stringify(delegationParameters));
            return response.redirectUrl;
        }
    }
}