import { StyleCompiler } from "@paperbits/common/styles";
import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { ISiteService } from "@paperbits/common/sites/ISiteService";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { Logger } from "@paperbits/common/logging";
import { TermsOfService } from "../../../contracts/identitySettings";
import { IdentityService } from "../../../services/identityService";
import { SigninSocialModel } from "./signinSocialModel";
import { SignInSocialViewModel } from "./react/SignInSocialViewModel";
import { isRedesignEnabledSetting } from "../../../constants";
import { BuiltInRoles } from "@paperbits/common/user";
import { StaticUserService } from "../../../services";


export class SigninSocialViewModelBinder implements ViewModelBinder<SigninSocialModel, SignInSocialViewModel> {
    constructor(
        private readonly identityService: IdentityService,
        private readonly styleCompiler: StyleCompiler,
        private readonly settingsProvider: ISettingsProvider,
        private readonly siteService: ISiteService,
        private readonly userService: StaticUserService,
        private readonly logger: Logger
    ) {
    }

    public async getTermsOfService(): Promise<TermsOfService> {
        const termsOfService = await this.identityService.getTermsOfService();
        return termsOfService;
    }

    public stateToInstance(state: WidgetState, componentInstance: SignInSocialViewModel): void {
        componentInstance.setState(prevState => <any>({
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

        const tenants = aadIdentityProvider.allowedTenants || [];
        
        if (aadIdentityProvider) {
            state.aadConfig = {
                classNames: classNames,
                label: model.aadLabel,
                tenants: tenants,
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

        state.security = model.security;

        const settings = await this.settingsProvider.getSettings();
        state.mode = settings["environment"];

        if (model.styles) {
            state.styles = await this.styleCompiler.getStyleModelAsync(model.styles);
        }

        const widgetRoles = state.security?.roles || [BuiltInRoles.everyone.key];

        const userRoles = await this.userService.getUserRoles();

        const visibleToUser =
            userRoles.some((x) => widgetRoles.includes(x)) ||
            widgetRoles.includes(BuiltInRoles.everyone.key);

        state.visible = visibleToUser;
        state.roles = widgetRoles.join(",");

        let isRedesignEnabled = false;

        try {
            isRedesignEnabled = !!(await this.siteService.getSetting(isRedesignEnabledSetting));
        }
        catch (error) {
            this.logger?.trackError(error, { message: `Failed to get setting: ${isRedesignEnabledSetting} - SigninSocialViewModelBinder` });
        }
        finally {
            state.isRedesignEnabled = isRedesignEnabled;
        }
    }
}