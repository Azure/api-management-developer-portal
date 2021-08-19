import { MapiClient } from ".";

export class PolicyService {
    constructor(private readonly mapiClient: MapiClient) { }

    public async getPolicyXmlForGlobalScope(): Promise<string> {
        try {
            const policyXml = await this.mapiClient.get<string>(`/policies/policy?format=rawxml`, [MapiClient.getPortalHeader("getPolicyXmlForGlobalScope")]);
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