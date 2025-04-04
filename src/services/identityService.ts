import { IApiClient } from "../clients";
import { IdentityProviderContract } from "../contracts/identityProvider";
import { Page } from "../models/page";
import { IdentityProvider } from "../models/identityProvider";
import { TenantService } from "./tenantService";
import { TermsOfService } from "../contracts/identitySettings";
import { Logger } from "@paperbits/common/logging";

/**
 * A service for management operations with identity providers.
 */
export class IdentityService {
    constructor(
        private readonly apiClient: IApiClient,
        private readonly tenantService: TenantService,
        private readonly logger: Logger) { }

    /**
     * Returns a collection of configured identity providers.
     */
    public async getIdentityProviders(): Promise<IdentityProvider[]> {
        const identityProviders = await this.apiClient.get<Page<IdentityProviderContract>>(
            "/identityProviders",
            [ await this.apiClient.getPortalHeader("getIdentityProviders") ]
        );

        try {
            return identityProviders.value.map(contract => new IdentityProvider(contract));
        } catch (error) {
            this.logger.trackEvent("IdentityService", { message: `Unable to parse identity providers. Value returned from: ${identityProviders ? Object.getOwnPropertyNames(identityProviders) : null }` });
            throw new Error("Unable to parse identity providers.");
        }

    }

    public async getTermsOfService(): Promise<TermsOfService> {
        const config = await this.tenantService.getSettings();
        return config && {
            consentRequired: config.signup.termsOfService.requireConsent,
            enabled: !!config.signup.termsOfService,
            text: config.signup.termsOfService.text,
        };
    }
}