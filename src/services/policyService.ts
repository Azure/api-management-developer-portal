import { IApiClient } from "../clients";

export class PolicyService {
    constructor(private readonly apiClient: IApiClient) { }

    public async getPolicyXmlForGlobalScope(): Promise<string> {
        try {
            const policyXml = await this.apiClient.get<string>(`/policies/policy?format=rawxml`, [await this.apiClient.getPortalHeader("getPolicyXmlForGlobalScope")]);
            return policyXml;
        }
        catch (error) {
            if (error.code === "ResourceNotFound") {
                return null;
            }
            else {
                throw error;
            }
        }
    }
}