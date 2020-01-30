import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { SignupSocialModel } from "./signupSocialModel";
import { SignupSocialContract } from "./signupSocialContract";


const nodeType = "signup-social";
const oldNodeType = "user-signup-social";

export class SignupSocialModelBinder implements IModelBinder<SignupSocialModel> {
    public canHandleContract(contract: Contract): boolean {
        return contract.type === nodeType || contract.type === oldNodeType;
    }

    public canHandleModel(model: Object): boolean {
        return model instanceof SignupSocialModel;
    }

    public async contractToModel(contract: SignupSocialContract): Promise<SignupSocialModel> {
        return new SignupSocialModel();
    }

    public modelToContract(model: SignupSocialModel): Contract {
        const contract: SignupSocialContract = {
            type: nodeType
        };

        return contract;
    }
}
