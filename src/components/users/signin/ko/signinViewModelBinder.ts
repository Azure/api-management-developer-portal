import { Bag } from "@paperbits/common";
import { ComponentFlow } from "@paperbits/common/editing";
import { EventManager } from "@paperbits/common/events";
import { ViewModelBinder } from "@paperbits/common/widgets";
import { DelegationAction, DelegationParameters } from "../../../../contracts/tenantSettings";
import { BackendService } from "../../../../services/backendService";
import { TenantService } from "../../../../services/tenantService";
import { SigninModel } from "../signinModel";
import { SigninViewModel } from "./signinViewModel";


export class SigninViewModelBinder implements ViewModelBinder<SigninModel, SigninViewModel> {
    
    constructor(
        private readonly eventManager: EventManager, 
        private readonly tenantService: TenantService,
        private readonly backendService: BackendService) {}

    public async modelToViewModel(model: SigninModel, viewModel?: SigninViewModel, bindingContext?: Bag<any>): Promise<SigninViewModel> {
        if (!viewModel) {
            viewModel = new SigninViewModel();
            viewModel["widgetBinding"] = {
                name: "signin",
                displayName: "Sign-in form: Basic",
                model: model,
                flow: ComponentFlow.Block,
                draggable: true,
                applyChanges: async (updatedModel: SigninModel) => {
                    this.modelToViewModel(updatedModel, viewModel, bindingContext);
                    this.eventManager.dispatchEvent("onContentUpdate");
                }
            };
        }

        const isDelegationEnabled = await this.tenantService.isDelegationEnabled();
        
        if (isDelegationEnabled) {
            const delegationParam = {};
            delegationParam[DelegationParameters.ReturnUrl] =  "/";
            const delegationUrl = await this.backendService.getDelegationUrl(DelegationAction.signIn, delegationParam);
            viewModel.delegationConfig(JSON.stringify({ delegationUrl: delegationUrl}));
        }

        return viewModel;
    }

    public canHandleModel(model: SigninModel): boolean {
        return model instanceof SigninModel;
    }
}