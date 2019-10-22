import { ViewModelBinder } from "@paperbits/common/widgets";
import { UserSignupViewModel } from "./userSignupViewModel";
import { UserSignupModel } from "../userSignupModel";
import { Bag } from "@paperbits/common";
import { IEventManager } from "@paperbits/common/events/IEventManager";
import { TenantService } from "../../../../services/tenantService";
import { DelegationAction, DelegationParameters } from "../../../../contracts/tenantSettings";
import { IdentityService } from "../../../../services";
import { TermsOfService } from "../../../../contracts/IdentitySettings";

export class UserSignupViewModelBinder implements ViewModelBinder<UserSignupModel, UserSignupViewModel> {

    constructor(
        private readonly eventManager: IEventManager,
        private readonly tenantService: TenantService,
        private readonly identityService: IdentityService) { }


    public async getTermsOfService(): Promise<TermsOfService> {
        const identutySetting = await this.identityService.getIdentitySetting()
        return identutySetting.properties.termsOfService;
    }

    public async modelToViewModel(model: UserSignupModel, viewModel?: UserSignupViewModel, bindingContext?: Bag<any>): Promise<UserSignupViewModel> {
        if (!viewModel) {
            viewModel = new UserSignupViewModel();
        }

        const delegationParam = {};
        delegationParam[DelegationParameters.ReturnUrl] =  "/";

        try {
            const delegationUrl = await this.tenantService.getDelegationUrl(DelegationAction.signIn, delegationParam);
            const termsOfService = await this.getTermsOfService();
            let params = {};
            if (delegationUrl) params["delegationUrl"] = delegationUrl;
            if (termsOfService.text) params["termsOfUse"] = termsOfService.text;
            if (termsOfService.consentRequired) params["isConsentRequired"] = termsOfService.consentRequired;
            if (termsOfService.enabled) params["termsEnabled"] = termsOfService.enabled;
            if (Object.keys(params).length !== 0) {
                const runtimeConfig = JSON.stringify(params);
                viewModel.runtimeConfig(runtimeConfig);
            }
        } catch (error) {
            throw error;
        }

        viewModel["widgetBinding"] = {
            displayName: "User signup",
            model: model,
            editor: "user-signup-editor",
            applyChanges: async (updatedModel: UserSignupModel) => {
                this.modelToViewModel(updatedModel, viewModel, bindingContext);
                this.eventManager.dispatchEvent("onContentUpdate");
            }
        };

        return viewModel;
    }

    public canHandleModel(model: UserSignupModel): boolean {
        return model instanceof UserSignupModel;
    }
}