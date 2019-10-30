import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { ChangePasswordModel } from "./changePasswordModel";
import { ChangePasswordContract } from "./changePasswordContract";


export class ChangePasswordModelBinder implements IModelBinder<ChangePasswordModel> {

    public canHandleContract(contract: Contract): boolean {
        return contract.type === "change-password";
    }

    public canHandleModel(model: Object): boolean {
        return model instanceof ChangePasswordModel;
    }

    public async contractToModel(contract: ChangePasswordContract): Promise<ChangePasswordModel> {
        const model = new ChangePasswordModel();
         model.requireHipCaptcha = contract.requireHipCaptcha;

        return model;
    }

    public modelToContract(model: ChangePasswordModel): Contract {
        const contract: ChangePasswordContract = {
            type: "change-password",
            requireHipCaptcha: model.requireHipCaptcha
        };

        return contract;
    }
}
