import { Bag } from "@paperbits/common";
import { ComponentFlow } from "@paperbits/common/editing";
import { EventManager, Events } from "@paperbits/common/events";
import { ViewModelBinder } from "@paperbits/common/widgets";
import { TermsOfService } from "../../../../contracts/identitySettings";
import { IdentityService } from "../../../../services";
import IDelegationService from "../../../../services/IDelegationService";
import { SigninModel } from "../signinModel";
import { SigninViewModel } from "./signinViewModel";


export class SigninViewModelBinder implements ViewModelBinder<SigninModel, SigninViewModel> {

    constructor(
        private readonly eventManager: EventManager,
        private readonly delegationService: IDelegationService,
        private readonly identityService: IdentityService) { }


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
                layer: bindingContext?.layer,
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

        const isDelegationEnabled = await this.delegationService.isUserRegistrationDelegationEnabled();

        if (isDelegationEnabled) {
            const delegationUrl = await this.delegationService.getDelegationSigninUrl("/");
            if (delegationUrl) {
                params["delegationUrl"] = delegationUrl;
            }
        }

        // Is necessary for displaying Terms of Use. Will be called when the back-end implementation is done
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