import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { SignupModel } from "./signupModel";
import { SignupContract } from "./signupContract";


const nodeType = "signup";

export class SignupModelBinder implements IModelBinder<SignupModel> {
    public async contractToModel(contract: SignupContract): Promise<SignupModel> {
        const model = new SignupModel();
        model.requireHipCaptcha = contract.requireHipCaptcha;
        model.styles = contract.styles ?? {};

        return model;
    }

    public modelToContract(model: SignupModel): Contract {
        const contract: SignupContract = {
            type: nodeType,
            requireHipCaptcha: model.requireHipCaptcha,
            styles: model.styles
        };

        return contract;
    }
}
