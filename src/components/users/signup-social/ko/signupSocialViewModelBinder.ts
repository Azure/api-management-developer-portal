import { Bag } from "@paperbits/common";
import { ComponentFlow } from "@paperbits/common/editing";
import { ViewModelBinder } from "@paperbits/common/widgets";
import { TermsOfService } from "../../../../contracts/identitySettings";
import { IdentityService } from "../../../../services/identityService";
import { SignupSocialModel } from "../signupSocialModel";
import { SignupSocialViewModel } from "./signupSocialViewModel";
import { ISettingsProvider } from "@paperbits/common/configuration";

export class SignupSocialViewModelBinder implements ViewModelBinder<SignupSocialModel, SignupSocialViewModel> {
    constructor(
        private readonly identityService: IdentityService,
        private readonly settingsProvider: ISettingsProvider
    ) { }

    public async getTermsOfService(): Promise<TermsOfService> {
        const identitySetting = await this.identityService.getIdentitySetting();
        return identitySetting.properties.termsOfService;
    }

    public async modelToViewModel(model: SignupSocialModel, viewModel?: SignupSocialViewModel, bindingContext?: Bag<any>): Promise<SignupSocialViewModel> {
        if (!viewModel) {
            viewModel = new SignupSocialViewModel();
        }

        viewModel["widgetBinding"] = {
            displayName: "Sign-up form: OAuth",
            layer: bindingContext?.layer,
            model: model,
            flow: ComponentFlow.Block,
            draggable: true
        };

        const identityProviders = await this.identityService.getIdentityProviders();

        const identityProvider = identityProviders.find(x => x.type === "aad" || x.type === "aadB2C");

        if (identityProvider) {
            viewModel.identityProvider(true);
        }

        const settings = await this.settingsProvider.getSettings();
        viewModel.mode(settings["environment"]);

        const params = {};
        const termsOfService = await this.getTermsOfService();
        if (termsOfService.text) params["termsOfUse"] = termsOfService.text;
        if (termsOfService.consentRequired) params["isConsentRequired"] = termsOfService.consentRequired;
        if (termsOfService.enabled) params["termsEnabled"] = termsOfService.enabled;

        if (Object.keys(params).length !== 0) {
            const runtimeConfig = JSON.stringify(params);
            viewModel.runtimeConfig(runtimeConfig);
        }

        return viewModel;
    }

    public canHandleModel(model: SignupSocialModel): boolean {
        return model instanceof SignupSocialModel;
    }
}