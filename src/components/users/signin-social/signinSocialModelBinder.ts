import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { SigninSocialModel } from "./signinSocialModel";
import { SigninSocialContract } from "./signinSocialContract";
import { BuiltInRoles } from "@paperbits/common/user";


const nodeType = "signin-social";
const oldNodeType = "userSigninSocial";

export class SigninSocialModelBinder implements IModelBinder<SigninSocialModel> {
    public canHandleModel(model: Object): boolean {
        return model instanceof SigninSocialModel;
    }

    public async contractToModel(contract: SigninSocialContract): Promise<SigninSocialModel> {
        const model = new SigninSocialModel();
        
        model.roles = contract.roles || [BuiltInRoles.everyone.key];
        model.styles = contract.styles || { appearance: "components/button/default" };
        model.aadLabel = contract.aadLabel || "Azure Active Directory";
        model.aadB2CLabel = contract.aadB2CLabel || "Azure Active Directory B2C";

        return model;
    }

    public canHandleContract(contract: Contract): boolean {
        return  contract.type === nodeType || contract.type === oldNodeType;
    }

    public modelToContract(model: SigninSocialModel): Contract {
        const roles = model.roles
            && model.roles.length === 1
            && model.roles[0] === BuiltInRoles.everyone.key
            ? null
            : model.roles;

        const contract: SigninSocialContract = {
            type: nodeType,
            styles: model.styles,
            roles: roles,
            aadLabel: model.aadLabel,
            aadB2CLabel: model.aadB2CLabel
        };

        return contract;
    }
}
