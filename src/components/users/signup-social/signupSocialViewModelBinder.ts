import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { TermsOfService } from "../../../contracts/identitySettings";
import { IdentityService } from "../../../services/identityService";
import { SignupSocialModel } from "./signupSocialModel";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { StyleCompiler } from "@paperbits/common/styles";
import { ISiteService } from "@paperbits/common/sites/ISiteService";
import { isRedesignEnabledSetting } from "../../../constants";
import { SignUpSocialViewModel } from "./react/SignUpSocialViewModel";


export class SignupSocialViewModelBinder implements ViewModelBinder<SignupSocialModel, SignUpSocialViewModel> {
    constructor(
        private readonly identityService: IdentityService,
        private readonly settingsProvider: ISettingsProvider,
        private readonly styleCompiler: StyleCompiler,
        private readonly siteService: ISiteService,
    ) { }

    public async getTermsOfService(): Promise<TermsOfService> {
        const identitySetting = await this.identityService.getIdentitySetting();
        return identitySetting.properties.termsOfService;
    }

    public stateToInstance(state: WidgetState, componentInstance: SignUpSocialViewModel): void {
        componentInstance.setState(prevState => ({
            isRedesignEnabled: state.isRedesignEnabled,
            styles: state.styles,
            termsOfUse: state.termsOfUse,
            isConsentRequired: state.isConsentRequired,
            termsEnabled: state.termsEnabled,
            identityProvider: state.identityProvider
        }));
    }

    public async modelToState(model: SignupSocialModel, state: WidgetState): Promise<void> {
        const identityProviders = await this.identityService.getIdentityProviders();
        const identityProvider = identityProviders.find(x => x.type === "aad" || x.type === "aadB2C");

        if (identityProvider) {
            state.identityProvider = true;
        }

        const settings = await this.settingsProvider.getSettings();
        state.mode = settings["environment"];

        const termsOfService = await this.getTermsOfService();
        state.termsOfUse = termsOfService.text;
        state.isConsentRequired = termsOfService.consentRequired;
        state.termsEnabled = termsOfService.enabled;

        if (model.styles) {
            state.styles = await this.styleCompiler.getStyleModelAsync(model.styles);
        }

        state.isRedesignEnabled = !!(await this.siteService.getSetting(isRedesignEnabledSetting));
    }
}