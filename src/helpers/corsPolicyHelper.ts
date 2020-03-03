import { PolicyService } from "../services/policyService";

export class CorsPolicyHelper {

    constructor(private readonly policyService: PolicyService) {

    }


    // public getConfiguredDomains(): Promise<void> {
    //     const globalPolicy = this.policyService.getPolicyXmlForGlobalScope();

    // }
}