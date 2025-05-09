import { ISettingsProvider } from "@paperbits/common/configuration";
import { SessionManager } from "@paperbits/common/persistence/sessionManager";
import { IdentityService } from ".";
import { adminUserId, SettingNames } from "../constants";
import { AadB2CClientConfig } from "../contracts/aadB2CClientConfig";
import { AadClientConfig } from "../contracts/aadClientConfig";
import { ArmService } from "./armService";
import { Logger } from "@paperbits/common/logging/logger";


/**
 * Runtime configurator propagates selected settings from designer to runtime components.
 */
export class RuntimeConfigurator {
    constructor(
        private readonly identityService: IdentityService,
        private readonly settingsProvider: ISettingsProvider,
        private readonly sessionManager: SessionManager,
        private readonly armService: ArmService
    ) {
        this.loadConfiguration();
    }

    public async loadConfiguration(): Promise<void> {
        await this.armService.loadSessionSettings(this.settingsProvider);
        const designTimeSettings = await this.sessionManager.getItem<object>(SettingNames.designTimeSettings) || {};
        designTimeSettings[SettingNames.isEditorMode] = true;

        /* Identity providers */
        const identityProviders = await this.identityService.getIdentityProviders();
        const aadIdentityProvider = identityProviders.find(x => x.type === SettingNames.aadClientConfig);

        if (aadIdentityProvider) {
            const aadConfig: AadClientConfig = {
                clientId: aadIdentityProvider.clientId,
                authority: aadIdentityProvider.authority,
                signinTenant: aadIdentityProvider.signinTenant,
                clientLibrary: aadIdentityProvider.clientLibrary
            };

            designTimeSettings[SettingNames.aadClientConfig] = aadConfig;
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

            designTimeSettings[SettingNames.aadB2CClientConfig] = aadB2CConfig;
        }

        await this.sessionManager.setItem(SettingNames.designTimeSettings, designTimeSettings);
    }
}
