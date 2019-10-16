import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { ConfirmPasswordModel } from "./confirmPasswordModel";
import { ConfirmPasswordContract } from "./confirmPasswordContract";


export class ConfirmPasswordModelBinder implements IModelBinder<ConfirmPasswordModel> {
    public canHandleModel(model: Object): boolean {
        return model instanceof ConfirmPasswordModel;
    }

    public async contractToModel(contract: ConfirmPasswordContract): Promise<ConfirmPasswordModel> {
        return new ConfirmPasswordModel();
    }

    public canHandleContract(contract: Contract): boolean {
        return contract.type === "confirmPassword";
    }

    public modelToContract(model: ConfirmPasswordModel): Contract {
        const contract: ConfirmPasswordContract = {
            type: "confirmPassword"
        };

        return contract;
    }
}
