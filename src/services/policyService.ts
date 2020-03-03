import { MapiClient } from ".";
import { HttpHeader } from "@paperbits/common/http";

export interface ArmPolicyContentWrapper {
    properties: {
        format: "xml" | "xml-link" | "rawxml" | "rawxml-link"
        value: string
    };
}

export class PolicyService {
    constructor(private readonly mapiClient: MapiClient) { }

    /**
     * Fetches policy for global scope.
     */
    public async getPolicyXmlForGlobalScope(): Promise<string> {
        try {
            const policyXml = await this.mapiClient.get<string>(`/policies/policy?format=rawxml`);
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

    /**
     * Sets policy for global scope.
     * @param {string} policyXml Policy XML document.
     */
    public setPolicyXmlForGlobalScope(policyXml: string, overwrite: boolean = true): Promise<Object> {
        const headers: HttpHeader[] = [];

        if (overwrite) {
            headers.push({ name: "If-Match", value: "*" });
        }

        headers.push({ name: "Content-Type", value: "application/json" });

        const armWrapper: ArmPolicyContentWrapper = {
            properties: {
                format: "rawxml",
                value: policyXml
            }
        };

        return this.mapiClient.put(`/policies/policy`, headers, armWrapper);
    }
}