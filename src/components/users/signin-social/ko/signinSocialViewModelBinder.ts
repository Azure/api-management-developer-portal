import { ComponentFlow } from "@paperbits/common/editing";
import { Bag } from "@paperbits/common";
import { EventManager, Events } from "@paperbits/common/events";
import { StyleCompiler } from "@paperbits/common/styles";
import { ViewModelBinder } from "@paperbits/common/widgets";
import { TermsOfService } from "../../../../contracts/identitySettings";
import { IdentityService } from "../../../../services/identityService";
import { SigninSocialModel } from "../signinSocialModel";
import { SigninSocialViewModel } from "./signinSocialViewModel";
import { ISettingsProvider } from "@paperbits/common/configuration";


export class SigninSocialViewModelBinder implements ViewModelBinder<SigninSocialModel, SigninSocialViewModel> {
    constructor(
        private readonly identityService: IdentityService,
        private readonly styleCompiler: StyleCompiler,
        private readonly eventManager: EventManager,
        private readonly settingsProvider: ISettingsProvider
    ) { }

    public async getTermsOfService(): Promise<TermsOfService> {
        const identitySetting = await this.identityService.getIdentitySetting();
        return identitySetting.properties.termsOfService;
    }

    public async modelToViewModel(model: SigninSocialModel, viewModel?: SigninSocialViewModel, bindingContext?: Bag<any>): Promise<SigninSocialViewModel> {
        if (!viewModel) {
            viewModel = new SigninSocialViewModel();

            viewModel["widgetBinding"] = {
                name: "signinSocial",
                displayName: "Sign-in button: OAuth",
                draggable: true,
                editor: "signin-social-editor",
                model: model,
                flow: ComponentFlow.Inline,
                applyChanges: () => {
                    this.modelToViewModel(model, viewModel, bindingContext);
                    this.eventManager.dispatchEvent(Events.ContentUpdate);
                }
            };
        }

        viewModel.roles(model.roles);

        let classNames;

        if (model.styles) {
            const styleModel = await this.styleCompiler.getStyleModelAsync(model.styles);
            classNames = styleModel.classNames;
        }

        const identityProviders = await this.identityService.getIdentityProviders();

        const aadIdentityProvider = identityProviders.find(x => x.type === "aad");
        const aadB2CIdentityProvider = identityProviders.find(x => x.type === "aadB2C");
        
        const termsOfService = await this.getTermsOfService();
        const termsOfUse = (termsOfService.text && termsOfService.enabled) ? termsOfService.text : undefined;

        if (aadIdentityProvider) {
            const aadConfig = {
                classNames: classNames,
                label: model.aadLabel,
                replyUrl: model.aadReplyUrl || undefined,
                termsOfUse: aadB2CIdentityProvider ? undefined : termsOfUse // display terms of use only once if both configs are present
            };
            viewModel.aadConfig(JSON.stringify(aadConfig));
        }

        if (aadB2CIdentityProvider) {
            const aadB2CConfig = {
                classNames: classNames,
                label: model.aadB2CLabel,
                replyUrl: model.aadB2CReplyUrl || undefined,
                termsOfUse
            };

            viewModel.aadB2CConfig(JSON.stringify(aadB2CConfig));
        }

        const settings = await this.settingsProvider.getSettings();
        viewModel.mode(settings["environment"]);

        return viewModel;
    }

    public canHandleModel(model: SigninSocialModel): boolean {
        return model instanceof SigninSocialModel;
    }
}