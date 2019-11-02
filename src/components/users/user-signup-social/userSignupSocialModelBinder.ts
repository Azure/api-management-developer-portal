import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { UserSignupSocialModel } from "./userSignupSocialModel";
import { UserSignupSocialContract } from "./userSignupSocialContract";


export class UserSignupSocialModelBinder implements IModelBinder<UserSignupSocialModel> {
    public canHandleContract(contract: Contract): boolean {
        return contract.type === "user-signup-social";
    }

    public canHandleModel(model: Object): boolean {
        return model instanceof UserSignupSocialModel;
    }

    public async contractToModel(contract: UserSignupSocialContract): Promise<UserSignupSocialModel> {
        return new UserSignupSocialModel();
    }

    public modelToContract(model: UserSignupSocialModel): Contract {
        const contract: UserSignupSocialContract = {
            type: "user-signup-social"
        };

        return contract;
    }
}
