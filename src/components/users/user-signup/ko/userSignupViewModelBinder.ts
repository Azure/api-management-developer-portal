import { ViewModelBinder } from "@paperbits/common/widgets";
import { UserSignupViewModel } from "./userSignupViewModel";
import { UserSignupModel } from "../userSignupModel";
import { Bag } from "@paperbits/common";
import { DelegationAction, DelegationParameters } from "../../../../contracts/tenantSettings";
import { BackendService } from "../../../../services/backendService";
import { TenantService } from "../../../../services/tenantService";
import { IdentityService } from "../../../../services";
import { TermsOfService } from "../../../../contracts/IdentitySettings";
import { ISettingsProvider } from "@paperbits/common/configuration/ISettingsProvider";

export class UserSignupViewModelBinder implements ViewModelBinder<UserSignupModel, UserSignupViewModel> {

    constructor(
        private readonly tenantService: TenantService,
        private readonly backendService: BackendService,
        private readonly settingsProvider: ISettingsProvider,
        private readonly identityService: IdentityService) { }

    public async getTermsOfService(): Promise<TermsOfService> {
        const identitySetting = await this.identityService.getIdentitySetting();
        return identitySetting.properties.termsOfService;
    }

    public async modelToViewModel(model: UserSignupModel, viewModel?: UserSignupViewModel, bindingContext?: Bag<any>): Promise<UserSignupViewModel> {
        if (!viewModel) {
            viewModel = new UserSignupViewModel();
        }

        const useHipCaptcha = await this.settingsProvider.getSetting<boolean>("useHipCaptcha");
        let params = { requireHipCaptcha: useHipCaptcha === undefined ? true : useHipCaptcha };

        const isDelegationEnabled = await this.tenantService.isDelegationEnabled();
        if (isDelegationEnabled) {
            const delegationParam = {};
            delegationParam[DelegationParameters.ReturnUrl] =  "/";

            const delegationUrl = await this.backendService.getDelegationUrl(DelegationAction.signIn, delegationParam);
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

        viewModel["widgetBinding"] = {
            displayName: "User signup",
            model: model,
            // editor: "user-signup-editor",
            // applyChanges: async (updatedModel: UserSignupModel) => {
            //     await this.modelToViewModel(updatedModel, viewModel, bindingContext);
            //     this.eventManager.dispatchEvent("onContentUpdate");
            // }
        };

        return viewModel;
    }

    public canHandleModel(model: UserSignupModel): boolean {
        return model instanceof UserSignupModel;
    }
}