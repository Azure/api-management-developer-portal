import { ViewModelBinder } from "@paperbits/common/widgets";
import { UserSigninViewModel } from "./userSigninViewModel";
import { UserSigninModel } from "../userSigninModel";
import { Bag } from "@paperbits/common";
import { TenantService } from "../../../../services/tenantService";
import { DelegationAction, DelegationParameters } from "../../../../contracts/tenantSettings";

export class UserSigninViewModelBinder implements ViewModelBinder<UserSigninModel, UserSigninViewModel> {
    
    constructor(private readonly tenantService: TenantService) {}

    public async modelToViewModel(model: UserSigninModel, viewModel?: UserSigninViewModel, bindingContext?: Bag<any>): Promise<UserSigninViewModel> {
        if (!viewModel) {
            viewModel = new UserSigninViewModel();
        }

        const delegationParam = {};
        delegationParam[DelegationParameters.ReturnUrl] =  "/";

        const delegationUrl = await this.tenantService.getDelegationUrl(DelegationAction.signIn, delegationParam);
        if (delegationUrl) {
            viewModel.delegationConfig(JSON.stringify({ delegationUrl: delegationUrl}));
        }

        viewModel["widgetBinding"] = {
            name: "User login",
            displayName: "Sign-in form",
            model: model,
            applyChanges: async (updatedModel: UserSigninModel) => {
                this.modelToViewModel(updatedModel, viewModel, bindingContext);
            }
        };

        return viewModel;
    }

    public canHandleModel(model: UserSigninModel): boolean {
        return model instanceof UserSigninModel;
    }
}