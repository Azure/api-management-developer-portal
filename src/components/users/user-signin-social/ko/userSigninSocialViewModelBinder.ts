import { ViewModelBinder } from "@paperbits/common/widgets";
import { UserSigninSocialViewModel } from "./userSigninSocialViewModel";
import { UserSigninSocialModel } from "../userSigninSocialModel";
import { Bag } from "@paperbits/common";
import { IdentityService } from "../../../../services/identityService";


export class UserSigninSocialViewModelBinder implements ViewModelBinder<UserSigninSocialModel, UserSigninSocialViewModel> {
    constructor(private readonly identityService: IdentityService) { }

    public async modelToViewModel(model: UserSigninSocialModel, viewModel?: UserSigninSocialViewModel, bindingContext?: Bag<any>): Promise<UserSigninSocialViewModel> {
        if (!viewModel) {
            viewModel = new UserSigninSocialViewModel();
        }

        const identityProviders = await this.identityService.getIdentityProviders();
        const aadIdentityProvider = identityProviders.find(x => x.type === "aad");

        if (aadIdentityProvider) {
            const aadConfig = {
                clientId: aadIdentityProvider.clientId,
                signinTenant: aadIdentityProvider.signinTenant
            };
            viewModel.aadConfig(JSON.stringify(aadConfig));
        }

        const aadB2CIdentityProvider = identityProviders.find(x => x.type === "aadB2C");

        if (aadB2CIdentityProvider) {
            let signinTenant = aadB2CIdentityProvider.signinTenant;

            if (!signinTenant && aadB2CIdentityProvider.allowedTenants.length > 0) {
                signinTenant = aadB2CIdentityProvider.allowedTenants[0];
            }

            const aadB2CConfig = {
                clientId: aadB2CIdentityProvider.clientId,
                authority: aadB2CIdentityProvider.authority,
                instance: signinTenant,
                signInPolicy: aadB2CIdentityProvider.signinPolicyName
            };

            viewModel.aadB2CConfig(JSON.stringify(aadB2CConfig));
        }

        viewModel["widgetBinding"] = {
            name: "signinSocial",
            displayName: "Social account sign-in",
            editor: "",
            model: model,
            applyChanges: () => {
                this.modelToViewModel(model, viewModel, bindingContext);
            }
        };

        return viewModel;
    }

    public canHandleModel(model: UserSigninSocialModel): boolean {
        return model instanceof UserSigninSocialModel;
    }
}