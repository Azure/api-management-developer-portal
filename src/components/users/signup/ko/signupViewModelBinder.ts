import { ViewModelBinder } from "@paperbits/common/widgets";
import { SignupViewModel } from "./signupViewModel";
import { SignupModel } from "../signupModel";
import { Bag } from "@paperbits/common";
import { DelegationAction, DelegationParameters } from "../../../../contracts/tenantSettings";
import { BackendService } from "../../../../services/backendService";
import { TenantService } from "../../../../services/tenantService";
import { IdentityService } from "../../../../services";
import { TermsOfService } from "../../../../contracts/IdentitySettings";
import { ISettingsProvider } from "@paperbits/common/configuration/ISettingsProvider";

export class SignupViewModelBinder implements ViewModelBinder<SignupModel, SignupViewModel> {

    constructor(
        private readonly tenantService: TenantService,
        private readonly backendService: BackendService,
        private readonly settingsProvider: ISettingsProvider,
        private readonly identityService: IdentityService) { }

    public async getTermsOfService(): Promise<TermsOfService> {
        const identitySetting = await this.identityService.getIdentitySetting();
        return identitySetting.properties.termsOfService;
    }

    public async modelToViewModel(model: SignupModel, viewModel?: SignupViewModel, bindingContext?: Bag<any>): Promise<SignupViewModel> {
        if (!viewModel) {
            viewModel = new SignupViewModel();
            viewModel["widgetBinding"] = {
                displayName: "Sign-up form: basic",
                model: model
            };
        }

        const useHipCaptcha = await this.settingsProvider.getSetting<boolean>("useHipCaptcha");
        const params = { requireHipCaptcha: useHipCaptcha === undefined ? true : useHipCaptcha };

        const isDelegationEnabled = await this.tenantService.isDelegationEnabled();
        if (isDelegationEnabled) {
            const delegationParam = {};
            delegationParam[DelegationParameters.ReturnUrl] =  "/";

            const delegationUrl = await this.backendService.getDelegationUrl(DelegationAction.signUp, delegationParam);
            if (delegationUrl) {
                params["delegationUrl"] = delegationUrl;
            }
        }

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

    public canHandleModel(model: SignupModel): boolean {
        return model instanceof SignupModel;
    }
}