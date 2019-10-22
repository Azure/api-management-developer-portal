import { ViewModelBinder } from "@paperbits/common/widgets";
import { UserSignupViewModel } from "./userSignupViewModel";
import { UserSignupModel } from "../userSignupModel";
import { Bag } from "@paperbits/common";
import { EventManager } from "@paperbits/common/events";
import { TenantService } from "../../../../services/tenantService";
import { DelegationAction, DelegationParameters } from "../../../../contracts/tenantSettings";

export class UserSignupViewModelBinder implements ViewModelBinder<UserSignupModel, UserSignupViewModel> {
    
    constructor(
        private readonly eventManager: EventManager, 
        private readonly tenantService: TenantService) {}
    
    public async modelToViewModel(model: UserSignupModel, viewModel?: UserSignupViewModel, bindingContext?: Bag<any>): Promise<UserSignupViewModel> {
        if (!viewModel) {
            viewModel = new UserSignupViewModel();
        }

        const delegationParam = {};
        delegationParam[DelegationParameters.ReturnUrl] =  "/";

        const delegationUrl = await this.tenantService.getDelegationUrl(DelegationAction.signIn, delegationParam);
        if (delegationUrl) {
            viewModel.delegationConfig(JSON.stringify({ delegationUrl: delegationUrl}));
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