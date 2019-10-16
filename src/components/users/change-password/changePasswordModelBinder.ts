import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { ChangePasswordModel } from "./changePasswordModel";
import { ChangePasswordContract } from "./changePasswordContract";


export class ChangePasswordModelBinder implements IModelBinder<ChangePasswordModel> {
    public canHandleModel(model: Object): boolean {
        return model instanceof ChangePasswordModel;
    }

    public async contractToModel(contract: ChangePasswordContract): Promise<ChangePasswordModel> {
        return new ChangePasswordModel();
    }

    public canHandleContract(contract: Contract): boolean {
        return contract.type === "changePassword";
    }

    public modelToContract(model: ChangePasswordModel): Contract {
        const contract: ChangePasswordContract = {
            type: "changePassword"
        };

        return contract;
    }
}
