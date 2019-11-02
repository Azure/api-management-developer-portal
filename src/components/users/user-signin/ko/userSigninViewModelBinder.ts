import { ViewModelBinder } from "@paperbits/common/widgets";
import { UserSigninViewModel } from "./userSigninViewModel";
import { UserSigninModel } from "../userSigninModel";
import { Bag } from "@paperbits/common";
import { TenantService } from "../../../../services/tenantService";
import { DelegationAction, DelegationParameters } from "../../../../contracts/tenantSettings";
import { BackendService } from "../../../../services/backendService";
import { EventManager } from "@paperbits/common/events";

export class UserSigninViewModelBinder implements ViewModelBinder<UserSigninModel, UserSigninViewModel> {
    
    constructor(
        private readonly eventManager: EventManager, 
        private readonly tenantService: TenantService,
        private readonly backendService: BackendService) {}

    public async modelToViewModel(model: UserSigninModel, viewModel?: UserSigninViewModel, bindingContext?: Bag<any>): Promise<UserSigninViewModel> {
        if (!viewModel) {
            viewModel = new UserSigninViewModel();
        }


        const isDelegationEnabled = await this.tenantService.isDelegationEnabled();
        if (isDelegationEnabled) {
            const delegationParam = {};
            delegationParam[DelegationParameters.ReturnUrl] =  "/";
            const delegationUrl = await this.backendService.getDelegationUrl(DelegationAction.signIn, delegationParam);
            viewModel.delegationConfig(JSON.stringify({ delegationUrl: delegationUrl}));
        }

        viewModel["widgetBinding"] = {
            name: "User login",
            displayName: "Sign in: Basic",
            model: model,
            applyChanges: async (updatedModel: UserSigninModel) => {
                this.modelToViewModel(updatedModel, viewModel, bindingContext);
                this.eventManager.dispatchEvent("onContentUpdate");
            }
        };

        return viewModel;
    }

    public canHandleModel(model: UserSigninModel): boolean {
        return model instanceof UserSigninModel;
    }
}