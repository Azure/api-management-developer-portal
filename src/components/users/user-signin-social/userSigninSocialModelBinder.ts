import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { UserSigninSocialModel } from "./userSigninSocialModel";
import { UserSigninSocialContract } from "./userSigninSocialContract";


export class UserSigninSocialModelBinder implements IModelBinder<UserSigninSocialModel> {
    public canHandleModel(model: Object): boolean {
        return model instanceof UserSigninSocialModel;
    }

    public async contractToModel(contract: UserSigninSocialContract): Promise<UserSigninSocialModel> {
        return new UserSigninSocialModel();
    }

    public canHandleContract(contract: Contract): boolean {
        return contract.type === "userSigninSocial";
    }

    public modelToContract(model: UserSigninSocialModel): Contract {
        const contract: UserSigninSocialContract = {
            type: "userSigninSocial"
        };

        return contract;
    }
}
