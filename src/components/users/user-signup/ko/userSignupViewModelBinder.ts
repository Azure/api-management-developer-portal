import { ViewModelBinder } from "@paperbits/common/widgets";
import { UserSignupViewModel } from "./userSignupViewModel";
import { UserSignupModel } from "../userSignupModel";
import { Bag } from "@paperbits/common";
import { TenantService } from "../../../../services/tenantService";
import { DelegationAction, DelegationParameters } from "../../../../contracts/tenantSettings";


export class UserSignupViewModelBinder implements ViewModelBinder<UserSignupModel, UserSignupViewModel> {
    
    constructor(private readonly tenantService: TenantService) {}
    
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
            name: "User signup",
            model: model,
            applyChanges: async (updatedModel: UserSignupModel) => {
                this.modelToViewModel(updatedModel, viewModel, bindingContext);
            }
        };

        return viewModel;
    }

    public canHandleModel(model: UserSignupModel): boolean {
        return model instanceof UserSignupModel;
    }
}