import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { UserLoginModel } from "./userLoginModel";
import { UserLoginContract } from "./userLoginContract";


export class UserLoginModelBinder implements IModelBinder {
    public canHandleModel(model: Object): boolean {
        return model instanceof UserLoginModel;
    }

    public async contractToModel(contract: UserLoginContract): Promise<UserLoginModel> {
        return new UserLoginModel();
    }

    public canHandleContract(contract: Contract): boolean {
        return contract.type === "userLogin";
    }

    public modelToContract(searchResultModel: UserLoginModel): Contract {
        const contract: UserLoginContract = {
            type: "userLogin"
        };

        return contract;
    }
}
