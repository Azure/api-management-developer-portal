import { ISettingsProvider } from "@paperbits/common/configuration";
import { StyleCompiler } from "@paperbits/common/styles";
import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { TermsOfService } from "../../../../contracts/identitySettings";
import { DelegationAction, DelegationParameters } from "../../../../contracts/tenantSettings";
import { IdentityService } from "../../../../services";
import { BackendService } from "../../../../services/backendService";
import { TenantService } from "../../../../services/tenantService";
import { SignupModel } from "../signupModel";
import { SignupViewModel } from "./signupViewModel";

export class SignupViewModelBinder implements ViewModelBinder<SignupModel, SignupViewModel> {

    constructor(
        private readonly tenantService: TenantService,
        private readonly backendService: BackendService,
        private readonly settingsProvider: ISettingsProvider,
        private readonly identityService: IdentityService,
        private readonly styleCompiler: StyleCompiler
    ) { }

    public async getTermsOfService(): Promise<TermsOfService> {
        const identitySetting = await this.identityService.getIdentitySetting();
        return identitySetting.properties.termsOfService;
    }

    public stateToInstance(state: WidgetState, componentInstance: SignupViewModel): void {
        componentInstance.styles(state.styles);

        componentInstance.runtimeConfig(JSON.stringify({
            termsOfUse: state.termsOfUse,
            isConsentRequired: state.isConsentRequired,
            termsEnabled: state.termsEnabled,
            requireHipCaptcha: state.requireHipCaptcha
        }));
    }

    public async modelToState(model: SignupModel, state: WidgetState): Promise<void> {
        const useHipCaptcha = await this.settingsProvider.getSetting<boolean>("useHipCaptcha");
        const isDelegationEnabled = await this.tenantService.isDelegationEnabled();

        if (isDelegationEnabled) {
            const delegationParam = {};
            delegationParam[DelegationParameters.ReturnUrl] = "/";

            const delegationUrl = await this.backendService.getDelegationUrlFromServer(DelegationAction.signUp, delegationParam);

            if (delegationUrl) {
                state.delegationUrl = delegationUrl;
            }
        }

        const termsOfService = await this.getTermsOfService();
        state.termsOfUse = termsOfService.text;
        state.isConsentRequired = termsOfService.consentRequired;
        state.termsEnabled = termsOfService.enabled;
        state.requireHipCaptcha = useHipCaptcha === undefined ? true : useHipCaptcha

        if (model.styles) {
            state.styles = await this.styleCompiler.getStyleModelAsync(model.styles);
        }
    }
}