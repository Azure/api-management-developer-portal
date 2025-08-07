import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { SigninSocialModel } from "./signinSocialModel";
import { SigninSocialContract } from "./signinSocialContract";
import { BuiltInRoles } from "@paperbits/common/user";


const nodeType = "signin-social";
const defaultRole = BuiltInRoles.everyone.key;

export class SigninSocialModelBinder implements IModelBinder<SigninSocialModel> {
    public async contractToModel(contract: SigninSocialContract): Promise<SigninSocialModel> {
        const model = new SigninSocialModel();

        if (contract.roles) { // migration from old contracts
            contract.security = {
                roles: contract.roles
            }
        }

        model.security = contract.security ?? { roles: [defaultRole] };
        model.styles = contract.styles || { appearance: "components/button/default" };
        model.aadLabel = contract.aadLabel || "Microsoft Entra ID";
        model.aadB2CLabel = contract.aadB2CLabel || "Azure Active Directory B2C";
        model.aadReplyUrl = contract.aadReplyUrl;
        model.aadB2CReplyUrl = contract.aadB2CReplyUrl;

        return model;
    }

    public modelToContract(model: SigninSocialModel): Contract {
        const contract: SigninSocialContract = {
            type: nodeType,
            aadLabel: model.aadLabel,
            aadReplyUrl: model.aadReplyUrl,
            aadB2CLabel: model.aadB2CLabel,
            aadB2CReplyUrl: model.aadB2CReplyUrl,
            styles: model.styles,
            security: model.security ?? { roles: [defaultRole] }
        };

        return contract;
    }
}
