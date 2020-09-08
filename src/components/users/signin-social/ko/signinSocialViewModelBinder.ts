import { Bag } from "@paperbits/common";
import { ViewModelBinder } from "@paperbits/common/widgets";
import { StyleCompiler } from "@paperbits/common/styles";
import { SigninSocialViewModel } from "./signinSocialViewModel";
import { SigninSocialModel } from "../signinSocialModel";
import { IdentityService } from "../../../../services/identityService";
import { EventManager } from "@paperbits/common/events";


export class SigninSocialViewModelBinder implements ViewModelBinder<SigninSocialModel, SigninSocialViewModel> {
    constructor(
        private readonly identityService: IdentityService,
        private readonly styleCompiler: StyleCompiler,
        private readonly eventManager: EventManager
    ) { }

    public async modelToViewModel(model: SigninSocialModel, viewModel?: SigninSocialViewModel, bindingContext?: Bag<any>): Promise<SigninSocialViewModel> {
        if (!viewModel) {
            viewModel = new SigninSocialViewModel();

            viewModel["widgetBinding"] = {
                name: "signinSocial",
                displayName: "Sign-in button: OAuth",
                editor: "signin-social-editor",
                model: model,
                applyChanges: () => {
                    this.modelToViewModel(model, viewModel, bindingContext);
                    this.eventManager.dispatchEvent("onContentUpdate");
                }
            };
        }

        viewModel.roles(model.roles);

        let classNames;

        if (model.styles) {
            const styleModel = await this.styleCompiler.getStyleModelAsync(model.styles);
            classNames = styleModel.classNames;
        }

        const identityProviders = await this.identityService.getIdentityProviders();
        const aadIdentityProvider = identityProviders.find(x => x.type === "aad");

        if (aadIdentityProvider) {
            const aadConfig = {
                clientId: aadIdentityProvider.clientId,
                authority: aadIdentityProvider.authority,
                signinTenant: aadIdentityProvider.signinTenant,
                classNames: classNames,
                label: model.aadLabel
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
                signInPolicy: aadB2CIdentityProvider.signinPolicyName,
                passwordResetPolicyName: aadB2CIdentityProvider.passwordResetPolicyName,
                classNames: classNames,
                label: model.aadB2CLabel
            };

            viewModel.aadB2CConfig(JSON.stringify(aadB2CConfig));
        }

        return viewModel;
    }

    public canHandleModel(model: SigninSocialModel): boolean {
        return model instanceof SigninSocialModel;
    }
}