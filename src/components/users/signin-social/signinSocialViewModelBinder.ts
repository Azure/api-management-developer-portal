import { ISettingsProvider } from "@paperbits/common/configuration";
import { StyleCompiler } from "@paperbits/common/styles";
import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { ISiteService } from "@paperbits/common/sites/ISiteService";
import { TermsOfService } from "../../../contracts/identitySettings";
import { IdentityService } from "../../../services/identityService";
import { SigninSocialModel } from "./signinSocialModel";
import { SignInSocialViewModel } from "./react/SignInSocialViewModel";
import { isRedesignEnabledSetting } from "../../../constants";

export class SigninSocialViewModelBinder implements ViewModelBinder<SigninSocialModel, SignInSocialViewModel> {
    constructor(
        private readonly identityService: IdentityService,
        private readonly styleCompiler: StyleCompiler,
        private readonly settingsProvider: ISettingsProvider,
        private readonly siteService: ISiteService,
    ) { }

    public async getTermsOfService(): Promise<TermsOfService> {
        const identitySetting = await this.identityService.getIdentitySetting();
        return identitySetting.properties.termsOfService;
    }

    public stateToInstance(state: WidgetState, componentInstance: SignInSocialViewModel): void {
        componentInstance.setState(prevState => ({
            ...state
        }));
    }

    public async modelToState(model: SigninSocialModel, state: WidgetState): Promise<void> {
        state.security = model.security;

        let classNames;

        if (model.styles) {
            const styleModel = await this.styleCompiler.getStyleModelAsync(model.styles);
            classNames = styleModel.classNames;
        }

        const identityProviders = await this.identityService.getIdentityProviders();

        const aadIdentityProvider = identityProviders.find(x => x.type === "aad");
        const aadB2CIdentityProvider = identityProviders.find(x => x.type === "aadB2C");

        // Is necessary for displaying Terms of Use. Will be called when the back-end implementation is done
        const termsOfService = await this.getTermsOfService();
        const termsOfUse = (termsOfService.text && termsOfService.enabled) ? termsOfService.text : undefined;

        if (aadIdentityProvider) {
            state.aadConfig = {
                classNames: classNames,
                label: model.aadLabel,
                replyUrl: model.aadReplyUrl || undefined,
                termsOfUse: aadB2CIdentityProvider ? undefined : termsOfUse // display terms of use only once if both configs are present
            };
        }

        if (aadB2CIdentityProvider) {
            state.aadB2CConfig = {
                classNames: classNames,
                label: model.aadB2CLabel,
                replyUrl: model.aadB2CReplyUrl || undefined,
                termsOfUse
            };
        }

        const settings = await this.settingsProvider.getSettings();
        state.mode = settings["environment"];

        if (model.styles) {
            state.styles = await this.styleCompiler.getStyleModelAsync(model.styles);
        }

        state.isRedesignEnabled = !!(await this.siteService.getSetting(isRedesignEnabledSetting));
    }
}