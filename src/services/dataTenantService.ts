import { DelegationSettings } from "../contracts/delegationSettings";
import { IApiClient } from "../clients";
import * as Constants from "./../constants";
import ITenantService from "./ITenantService";

/**
 * A service for management operations with Data API tenant.
 */
export class DataTenantService implements ITenantService {
    constructor(private readonly apiClient: IApiClient) { }

    /**
     * Returns delegation settings.
     */
    private async getDelegationSettings(): Promise<DelegationSettings> {
        return await this.apiClient.get(`/delegation/settings?api-version=${Constants.managementApiVersion}`, [await this.apiClient.getPortalHeader("getDelegationSettings")]);
    }

    //TODO: Not implemented.
    public async getServiceSkuName(): Promise<string> {
        return "Developer";
    }

    public async isDelegationEnabled(): Promise<boolean> {
        const delegationSettings = await this.getDelegationSettings();
        return delegationSettings?.signin;
    }

    public async isSubscriptionDelegationEnabled(): Promise<boolean> {
        const delegationSettings = await this.getDelegationSettings();
        return delegationSettings?.subscribe
    }
}