import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { SignupModel } from "./signupModel";
import { SignupContract } from "./signupContract";


const nodeType = "signup";
const oldNodeType = "user-signup";

export class SignupModelBinder implements IModelBinder<SignupModel> {

    public canHandleContract(contract: Contract): boolean {
        return contract.type === nodeType || contract.type === oldNodeType;
    }

    public canHandleModel(model: Object): boolean {
        return model instanceof SignupModel;
    }

    public async contractToModel(contract: SignupContract): Promise<SignupModel> {
        const model = new SignupModel();
        model.requireHipCaptcha = contract.requireHipCaptcha;

        return model;
    }

    public modelToContract(model: SignupModel): Contract {
        const contract: SignupContract = {
            type: nodeType,
            requireHipCaptcha: model.requireHipCaptcha
        };

        return contract;
    }
}
