import { Bag } from "@paperbits/common";
import { ComponentFlow } from "@paperbits/common/editing";
import { EventManager, Events } from "@paperbits/common/events";
import { ViewModelBinder } from "@paperbits/common/widgets";
import { TermsOfService } from "../../../../contracts/identitySettings";
import { DelegationAction, DelegationParameters } from "../../../../contracts/tenantSettings";
import { IdentityService } from "../../../../services";
import { BackendService } from "../../../../services/backendService";
import { TenantService } from "../../../../services/tenantService";
import { SigninModel } from "../signinModel";
import { SigninViewModel } from "./signinViewModel";


export class SigninViewModelBinder implements ViewModelBinder<SigninModel, SigninViewModel> {
    
    constructor(
        private readonly eventManager: EventManager, 
        private readonly tenantService: TenantService,
        private readonly backendService: BackendService,
        private readonly identityService: IdentityService) {}

    public async getTermsOfService(): Promise<TermsOfService> {
        const identitySetting = await this.identityService.getIdentitySetting();
        return identitySetting.properties.termsOfService;
    }

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
                    this.eventManager.dispatchEvent(Events.ContentUpdate);
                }
            };
        }

        const params = {};

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

        return viewModel;
    }

    public canHandleModel(model: SigninModel): boolean {
        return model instanceof SigninModel;
    }
}