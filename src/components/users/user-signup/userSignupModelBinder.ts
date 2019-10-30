import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { UserSignupModel } from "./userSignupModel";
import { UserSignupContract } from "./userSignupContract";


export class UserSignupModelBinder implements IModelBinder<UserSignupModel> {

    public canHandleContract(contract: Contract): boolean {
        return contract.type === "user-signup";
    }

    public canHandleModel(model: Object): boolean {
        return model instanceof UserSignupModel;
    }

    public async contractToModel(contract: UserSignupContract): Promise<UserSignupModel> {
        const model = new UserSignupModel();
        model.requireHipCaptcha = contract.requireHipCaptcha;

        return model;
    }

    public modelToContract(model: UserSignupModel): Contract {
        const contract: UserSignupContract = {
            type: "user-signup",
            requireHipCaptcha: model.requireHipCaptcha
        };

        return contract;
    }
}
