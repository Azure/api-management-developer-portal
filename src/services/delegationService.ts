import { IApiClient } from "../clients";
import { DelegationAction, DelegationActionPath } from "../contracts/tenantSettings";
import { DeveloperPortalType, SettingNames } from "../constants";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { DelegationSettings } from "../contracts/delegationSettings";
import IDelegationService from "./IDelegationService";

interface SigninDelegationResponse {
    ssoLoginUri: string;
}

interface UserDelegationResponse {
    redirectUrl: string;
}

export class DelegationService implements IDelegationService {
    private developerPortalType: string;

    constructor(
        private readonly apiClient: IApiClient,
        private readonly settingsProvider: ISettingsProvider) { }

    private async initialize() {
        if (!this.developerPortalType) {
            const settings = await this.settingsProvider.getSettings();
            this.developerPortalType = settings[SettingNames.developerPortalType] || DeveloperPortalType.selfHosted;
        }
    }

    private async getDelegationSettings(): Promise<DelegationSettings> {
        return await this.apiClient.get(`/delegation/settings`);
    }

    public async isSigninDelegationEnabled(): Promise<boolean> {
        const delegationSettings = await this.getDelegationSettings();
        return delegationSettings?.signin;
    }

    public async isSubscriptionDelegationEnabled(): Promise<boolean> {
        const delegationSettings = await this.getDelegationSettings();
        return delegationSettings?.subscribe
    }

    public async getDelegationSigninUrl(returnUrl: string): Promise<string> {
        var payload = {
            returnUrl: returnUrl
        }
        const response = await this.apiClient.post<SigninDelegationResponse>("/delegation/urls/signin", null, JSON.stringify(payload));
        return response.ssoLoginUri;
    }

    public async getUserDelegationUrl(action: DelegationAction, userId: string, productId?: string, subscriptionId?: string): Promise<string> {
        await this.initialize();

        if (this.developerPortalType === DeveloperPortalType.managed) {
            var delegationParameters = {
                userId: userId,
                productId: productId,
                subscriptionId: subscriptionId,
            }
            const queryParams = new URLSearchParams();
            Object.keys(delegationParameters).map(key => {
                const val = delegationParameters[key];
                if (!!val) {
                    queryParams.append(key, val);
                }
            });
            return `/${DelegationActionPath[action]}?${queryParams.toString()}`;
        }
        else {
            var payload = {
                productId: productId,
                subscriptionId: subscriptionId
            }
            const response = await this.apiClient.post<UserDelegationResponse>(`/delegation/urls/users/${userId}/${action}`, null, JSON.stringify(payload));
            return response.redirectUrl;
        }
    }
}