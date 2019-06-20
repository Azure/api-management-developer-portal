import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { UserSignupModel } from "./userSignupModel";
import { UserSignupContract } from "./userSignupContract";


export class UserSignupModelBinder implements IModelBinder<UserSignupModel> {
    public canHandleModel(model: Object): boolean {
        return model instanceof UserSignupModel;
    }

    public async contractToModel(contract: UserSignupContract): Promise<UserSignupModel> {
        return new UserSignupModel();
    }

    public canHandleContract(contract: Contract): boolean {
        return contract.type === "userSignup";
    }

    public modelToContract(model: UserSignupModel): Contract {
        const contract: UserSignupContract = {
            type: "userSignup"
        };

        return contract;
    }
}
