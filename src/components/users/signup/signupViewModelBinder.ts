import { ISettingsProvider } from "@paperbits/common/configuration";
import { StyleCompiler } from "@paperbits/common/styles";
import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { ISiteService } from "@paperbits/common/sites/ISiteService";
import { IDelegationService } from "../../../services/IDelegationService";
import { Logger } from "@paperbits/common/logging";
import { TermsOfService } from "../../../contracts/identitySettings";
import { IdentityService } from "../../../services";
import { SignupModel } from "./signupModel";
import { SignUpViewModel } from "./react/SignUpViewModel";
import { isRedesignEnabledSetting } from "../../../constants";

export class SignupViewModelBinder implements ViewModelBinder<SignupModel, SignUpViewModel> {

    constructor(
        private readonly delegationService: IDelegationService,
        private readonly settingsProvider: ISettingsProvider,
        private readonly identityService: IdentityService,
        private readonly styleCompiler: StyleCompiler,
        private readonly siteService: ISiteService,
        private readonly logger: Logger
    ) { }

    public async getTermsOfService(): Promise<TermsOfService> {
        const termsOfService = await this.identityService.getTermsOfService();
        return termsOfService;
    }

    public stateToInstance(nextState: WidgetState, componentInstance: any): void {
        componentInstance.setState(prevState => ({
            isRedesignEnabled: nextState.isRedesignEnabled,
            initialCount: nextState.initialCount,
            styles: nextState.styles,
            termsOfUse: nextState.termsOfUse,
            isConsentRequired: nextState.isConsentRequired,
            termsEnabled: nextState.termsEnabled,
            requireHipCaptcha: nextState.requireHipCaptcha
        }));
    }

    public async modelToState(model: SignupModel, state: WidgetState): Promise<void> {
        const useHipCaptcha = await this.settingsProvider.getSetting<boolean>("useHipCaptcha");

        const isDelegationEnabled = await this.delegationService.isUserRegistrationDelegationEnabled();
        if (isDelegationEnabled) {
            const delegationUrl = await this.delegationService.getDelegatedSignupUrl("/");
            if (delegationUrl) {
                state.delegationUrl = delegationUrl;
            }
        }

        const termsOfService = await this.getTermsOfService();
        state.termsOfUse = termsOfService.text;
        state.isConsentRequired = termsOfService.consentRequired;
        state.termsEnabled = termsOfService.enabled;
        state.requireHipCaptcha = useHipCaptcha ?? true

        if (model.styles) {
            state.styles = await this.styleCompiler.getStyleModelAsync(model.styles);
        }

        let isRedesignEnabled = false;
        
        try {
            isRedesignEnabled = !!(await this.siteService.getSetting(isRedesignEnabledSetting));
        } catch (error) {
            this.logger?.trackError(error, { message: `Failed to get setting: ${isRedesignEnabledSetting} - SignupViewModelBinder` });
        } finally {
            state.isRedesignEnabled = isRedesignEnabled;
        }
    }
}