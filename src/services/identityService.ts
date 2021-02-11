import { MapiClient } from "./mapiClient";
import { IdentityProviderContract } from "../contracts/identityProvider";
import { Page } from "../models/page";
import { IdentityProvider } from "../models/identityProvider";
import { IdentitySettingContract } from "../contracts/IdentitySettings";

/**
 * A service for management operations with identity providers.
 */
export class IdentityService {
    constructor(private readonly mapiClient: MapiClient) { }

    /**
     * Returns a collection of configured identity providers.
     */
    public async getIdentityProviders(): Promise<IdentityProvider[]> {
        const identityProviders = await this.mapiClient.get<Page<IdentityProviderContract>>("/identityProviders", [MapiClient.getPortalHeader("getIdentityProviders")]);
        return identityProviders.value.map(contract => new IdentityProvider(contract));
    }
    
    public async getIdentitySetting(): Promise<IdentitySettingContract> {
        return await this.mapiClient.get<IdentitySettingContract>("/portalsettings/signup", [MapiClient.getPortalHeader("getIdentitySetting")]);
    }
}