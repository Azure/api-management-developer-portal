import { IPublisher } from "@paperbits/common/publishing";
import { SettingNames } from "../constants";
import { IdentityService } from "../services";
import { AadB2CClientConfig } from "./../contracts/aadB2CClientConfig";
import { AadClientConfig } from "./../contracts/aadClientConfig";
import { RuntimeConfigBuilder } from "./runtimeConfigBuilder";


/**
 * AAD configuration publisher propagates public AAD/B2C identity provider settings to runtime configuration.
 */
export class AadConfigPublisher implements IPublisher {
    constructor(
        private readonly runtimeConfigBuilder: RuntimeConfigBuilder,
        private readonly identityService: IdentityService
    ) { }

    public async publish(): Promise<void> {
        const identityProviders = await this.identityService.getIdentityProviders();

        const aadIdentityProvider = identityProviders.find(x => x.type === SettingNames.aadClientConfig);

        if (aadIdentityProvider) {
            const aadConfig: AadClientConfig = {
                clientId: aadIdentityProvider.clientId,
                authority: aadIdentityProvider.authority,
                signinTenant: aadIdentityProvider.signinTenant,
                allowedTenants: aadIdentityProvider.allowedTenants,
                clientLibrary: aadIdentityProvider.clientLibrary
            };

            this.runtimeConfigBuilder.addSetting(SettingNames.aadClientConfig, aadConfig);
        }

        const aadB2CIdentityProvider = identityProviders.find(x => x.type === SettingNames.aadB2CClientConfig);

        if (aadB2CIdentityProvider) {
            let signinTenant = aadB2CIdentityProvider.signinTenant;

            if (!signinTenant && aadB2CIdentityProvider.allowedTenants.length > 0) {
                signinTenant = aadB2CIdentityProvider.allowedTenants[0];
            }

            const aadB2CConfig: AadB2CClientConfig = {
                clientId: aadB2CIdentityProvider.clientId,
                authority: aadB2CIdentityProvider.authority,
                signinTenant: signinTenant,
                signinPolicyName: aadB2CIdentityProvider.signinPolicyName,
                signupPolicyName: aadB2CIdentityProvider.signupPolicyName,
                passwordResetPolicyName: aadB2CIdentityProvider.passwordResetPolicyName,
                clientLibrary: aadB2CIdentityProvider.clientLibrary
            };

            this.runtimeConfigBuilder.addSetting(SettingNames.aadB2CClientConfig, aadB2CConfig);
        }
    }
}