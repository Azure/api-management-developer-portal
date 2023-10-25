import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { ChangePasswordModel } from "./changePasswordModel";
import { ChangePasswordContract } from "./changePasswordContract";


export class ChangePasswordModelBinder implements IModelBinder<ChangePasswordModel> {
    public async contractToModel(contract: ChangePasswordContract): Promise<ChangePasswordModel> {
        const model = new ChangePasswordModel();
        model.requireHipCaptcha = contract.requireHipCaptcha;
        model.styles = contract.styles ?? {};

        return model;
    }

    public modelToContract(model: ChangePasswordModel): Contract {
        const contract: ChangePasswordContract = {
            type: "change-password",
            requireHipCaptcha: model.requireHipCaptcha,
            styles: model.styles
        };

        return contract;
    }
}
