import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { ConfirmPasswordModel } from "./confirmPasswordModel";
import { ConfirmPasswordContract } from "./confirmPasswordContract";


export class ConfirmPasswordModelBinder implements IModelBinder<ConfirmPasswordModel> {
    public async contractToModel(contract: ConfirmPasswordContract): Promise<ConfirmPasswordModel> {
        const model = new ConfirmPasswordModel();
        model.styles = contract.styles ?? {};
        return model;
    }

    public modelToContract(model: ConfirmPasswordModel): Contract {
        const contract: ConfirmPasswordContract = {
            type: "confirmPassword",
            styles: model.styles
        };
        return contract;
    }
}
