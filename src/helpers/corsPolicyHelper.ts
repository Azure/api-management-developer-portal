import { PolicyService } from "../services/policyService";
import { PolicyMap } from "./policyMap";
import { CorsPolicy } from "./corsPolicy";
import { RequestPolicy } from "./requestPolicy";
import { JObject } from "./jObject";

export class CorsPolicyHelper {
    constructor(private readonly policyService: PolicyService) {
        PolicyMap["cors"] = CorsPolicy;
        PolicyMap["root"] = RequestPolicy;
    }

    public async getConfiguredOrigins(): Promise<string[]> {
        const globalPolicyXml = await this.policyService.getPolicyXmlForGlobalScope();
        const globalPolicyJObject = JObject.fromXml(globalPolicyXml);
        const requestPolicy = RequestPolicy.fromConfig(globalPolicyJObject);
        const corsPolicy = <CorsPolicy>requestPolicy.findChildPolicy("cors");

        if (!corsPolicy) {
            return [];
        }

        return corsPolicy.allowedOrigins;
    }

    public async configureOrigins(): Promise<void> {
        const globalPolicyXml = await this.policyService.getPolicyXmlForGlobalScope();
        const requestPolicy = RequestPolicy.fromXml(globalPolicyXml);

        let corsPolicy = <CorsPolicy>requestPolicy.findChildPolicy("cors");

        if (!corsPolicy) {
            corsPolicy = new CorsPolicy();
            const inboundPolicy = <CorsPolicy>requestPolicy.findChildPolicy("inbound");

            inboundPolicy.policies.push(corsPolicy);
        }

        if (corsPolicy.allowedOrigins.includes("*")) {
            return;
        }

        const portalHostnames = ["alzalson.developer.azure-api.net"]; // TODO: Get from configuration.

        const origins = portalHostnames
            .map(x => `https://${x}`)
            .filter(x => !corsPolicy.allowedOrigins.includes(x));

        corsPolicy.allowedOrigins.push(...origins);

        await this.policyService.setPolicyXmlForGlobalScope(requestPolicy.toXml());
    }
}