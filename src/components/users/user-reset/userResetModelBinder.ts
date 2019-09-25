import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { UserResetModel } from "./userResetModel";
import { UserResetContract } from "./userResetContract";


export class UserResetModelBinder implements IModelBinder<UserResetModel> {
    public canHandleModel(model: Object): boolean {
        return model instanceof UserResetModel;
    }

    public async contractToModel(contract: UserResetContract): Promise<UserResetModel> {
        return new UserResetModel();
    }

    public canHandleContract(contract: Contract): boolean {
        return contract.type === "userReset";
    }

    public modelToContract(model: UserResetModel): Contract {
        const contract: UserResetContract = {
            type: "userReset"
        };

        return contract;
    }
}
