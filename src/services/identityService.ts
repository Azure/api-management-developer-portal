import { IApiClient } from "../clients";
import { IdentityProviderContract } from "../contracts/identityProvider";
import { Page } from "../models/page";
import { IdentityProvider } from "../models/identityProvider";
import { IdentitySettingContract } from "../contracts/identitySettings";

/**
 * A service for management operations with identity providers.
 */
export class IdentityService {
    constructor(private readonly apiClient: IApiClient) { }

    /**
     * Returns a collection of configured identity providers.
     */
    public async getIdentityProviders(): Promise<IdentityProvider[]> {
        const identityProviders = await this.apiClient.get<Page<IdentityProviderContract>>("/identityProviders", [await this.apiClient.getPortalHeader("getIdentityProviders")]);
        return identityProviders.value.map(contract => new IdentityProvider(contract));
    }

    public async getIdentitySetting(): Promise<IdentitySettingContract> {
        return await this.apiClient.get<IdentitySettingContract>("/portalsettings/signup", [await this.apiClient.getPortalHeader("getIdentitySetting")]);
    }
}