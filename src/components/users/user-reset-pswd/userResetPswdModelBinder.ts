import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { UserResetPswdModel } from "./userResetPswdModel";
import { UserResetPswdContract } from "./userResetPswdContract";


export class UserResetPswdModelBinder implements IModelBinder<UserResetPswdModel> {
    public canHandleModel(model: Object): boolean {
        return model instanceof UserResetPswdModel;
    }

    public async contractToModel(contract: UserResetPswdContract): Promise<UserResetPswdModel> {
        return new UserResetPswdModel();
    }

    public canHandleContract(contract: Contract): boolean {
        return contract.type === "userResetPswd";
    }

    public modelToContract(model: UserResetPswdModel): Contract {
        const contract: UserResetPswdContract = {
            type: "userResetPswd"
        };

        return contract;
    }
}
