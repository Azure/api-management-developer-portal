import { ViewModelBinder } from "@paperbits/common/widgets";
import { UserSigninSocialViewModel } from "./userSigninSocialViewModel";
import { UserSigninSocialModel } from "../userSigninSocialModel";
import { Bag } from "@paperbits/common";
import { IdentityService } from "../../../../services/identityService";


interface RuntimeConfiguration {
    aadClientId?: string;
}

export class UserSigninSocialViewModelBinder implements ViewModelBinder<UserSigninSocialModel, UserSigninSocialViewModel> {
    constructor(private readonly identityService: IdentityService) { }

    public async modelToViewModel(model: UserSigninSocialModel, viewModel?: UserSigninSocialViewModel, bindingContext?: Bag<any>): Promise<UserSigninSocialViewModel> {
        if (!viewModel) {
            viewModel = new UserSigninSocialViewModel();
        }

        const identityProviders = await this.identityService.getIdentityProviders();
        const aadIdentityProvider = identityProviders.find(x => x.type === "aad");
        const configuration: RuntimeConfiguration = {};

        if (aadIdentityProvider) {
            configuration.aadClientId = aadIdentityProvider.clientId;
        }

        viewModel.params(JSON.stringify(configuration));

        viewModel["widgetBinding"] = {
            name: "User login",
            displayName: "Sign-in form",
            model: model,
            applyChanges: async (updatedModel: UserSigninSocialModel) => {
                this.modelToViewModel(model, viewModel, bindingContext);
            }
        };

        return viewModel;
    }

    public canHandleModel(model: UserSigninSocialModel): boolean {
        return model instanceof UserSigninSocialModel;
    }
}