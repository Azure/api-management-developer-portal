import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { UserSigninSocialModel } from "./userSigninSocialModel";
import { UserSigninSocialContract } from "./userSigninSocialContract";


const nodeType = "userSigninSocial";

export class UserSigninSocialModelBinder implements IModelBinder<UserSigninSocialModel> {
    public canHandleModel(model: Object): boolean {
        return model instanceof UserSigninSocialModel;
    }

    public async contractToModel(contract: UserSigninSocialContract): Promise<UserSigninSocialModel> {
        return new UserSigninSocialModel();
    }

    public canHandleContract(contract: Contract): boolean {
        return contract.type === nodeType;
    }

    public modelToContract(model: UserSigninSocialModel): Contract {
        const contract: UserSigninSocialContract = {
            type: nodeType
        };

        return contract;
    }
}
