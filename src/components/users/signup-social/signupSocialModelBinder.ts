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
        const model = new SignupSocialModel();
        model.styles = contract.styles ?? {};

        return model;
    }

    public modelToContract(model: SignupSocialModel): Contract {
        const contract: SignupSocialContract = {
            type: nodeType,
            styles: model.styles
        };

        return contract;
    }
}
