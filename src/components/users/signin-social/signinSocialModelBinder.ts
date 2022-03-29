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
        model.aadReplyUrl = contract.aadReplyUrl;
        model.aadB2CReplyUrl = contract.aadB2CReplyUrl;

        return model;
    }

    public canHandleContract(contract: Contract): boolean {
        return contract.type === nodeType || contract.type === oldNodeType;
    }

    public modelToContract(model: SigninSocialModel): Contract {
        const roles = model.roles
            && model.roles.length === 1
            && model.roles[0] === BuiltInRoles.everyone.key
            ? null
            : model.roles;

        const contract: SigninSocialContract = {
            type: nodeType,
            aadLabel: model.aadLabel,
            aadReplyUrl: model.aadReplyUrl,
            aadB2CLabel: model.aadB2CLabel,
            aadB2CReplyUrl: model.aadB2CReplyUrl,
            styles: model.styles,
            roles: roles
        };

        return contract;
    }
}
