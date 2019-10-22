import { ViewModelBinder } from "@paperbits/common/widgets";
import { UserSignupViewModel } from "./userSignupViewModel";
import { UserSignupModel } from "../userSignupModel";
import { Bag } from "@paperbits/common";
import { IEventManager } from "@paperbits/common/events/IEventManager";
import { TenantService } from "../../../../services/tenantService";
import { DelegationAction, DelegationParameters } from "../../../../contracts/tenantSettings";
import { IdentityService } from "../../../../services";

export class UserSignupViewModelBinder implements ViewModelBinder<UserSignupModel, UserSignupViewModel> {

    constructor(
        private readonly eventManager: IEventManager,
        private readonly tenantService: TenantService,
        private readonly identityService: IdentityService) { }


    public async getTermsOfUse(): Promise<string> {
        const identutySetting = await this.identityService.getIdentitySetting()
        return identutySetting.properties.termsOfService.text;
    }

    public async modelToViewModel(model: UserSignupModel, viewModel?: UserSignupViewModel, bindingContext?: Bag<any>): Promise<UserSignupViewModel> {
        if (!viewModel) {
            viewModel = new UserSignupViewModel();
        }

        const delegationParam = {};
        delegationParam[DelegationParameters.ReturnUrl] =  "/";

        const delegationUrl = await this.tenantService.getDelegationUrl(DelegationAction.signIn, delegationParam);
        const termsOfUse = await this.getTermsOfUse();
        const runtimeConfig = JSON.stringify({
            delegationUrl: delegationUrl,
            termsOfUse: termsOfUse
        });
        viewModel.runtimeConfig(runtimeConfig);

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