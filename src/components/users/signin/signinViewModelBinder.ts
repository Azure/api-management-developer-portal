import { StyleCompiler } from "@paperbits/common/styles";
import { ISiteService } from "@paperbits/common/sites/ISiteService";
import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { TermsOfService } from "../../../contracts/identitySettings";
import { DelegationAction, DelegationParameters } from "../../../contracts/tenantSettings";
import { IdentityService } from "../../../services";
import { BackendService } from "../../../services/backendService";
import { TenantService } from "../../../services/tenantService";
import { isRedesignEnabledSetting } from "../../../constants";
import { SigninModel } from "./signinModel";
import { SigninViewModel } from "./react/SigninViewModel";


export class SigninViewModelBinder implements ViewModelBinder<SigninModel, SigninViewModel> {
    constructor(
        private readonly tenantService: TenantService,
        private readonly backendService: BackendService,
        private readonly identityService: IdentityService,
        private readonly styleCompiler: StyleCompiler,
        private readonly siteService: ISiteService,
    ) {}

    public async getTermsOfService(): Promise<TermsOfService> {
        const identitySetting = await this.identityService.getIdentitySetting();
        return identitySetting.properties.termsOfService;
    }

    public stateToInstance(state: WidgetState, componentInstance: SigninViewModel): void {
        componentInstance.setState(prevState => ({
            isRedesignEnabled: state.isRedesignEnabled,
            styles: state.styles,
            termsOfUse: state.termsOfUse,
            isConsentRequired: state.isConsentRequired,
            termsEnabled: state.termsEnabled,
            requireHipCaptcha: state.requireHipCaptcha
        }));
    }

    public async modelToState(model: SigninModel, state: WidgetState): Promise<void> {
        const isDelegationEnabled = await this.tenantService.isDelegationEnabled();

        if (isDelegationEnabled) {
            const delegationParam = {};
            delegationParam[DelegationParameters.ReturnUrl] = "/";

            const delegationUrl = await this.backendService.getDelegationUrlFromServer(DelegationAction.signIn, delegationParam);

            if (delegationUrl) {
                state.delegationUrl = delegationUrl;
            }
        }

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