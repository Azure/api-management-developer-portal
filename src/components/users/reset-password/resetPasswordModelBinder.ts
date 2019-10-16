import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { ResetPasswordModel } from "./resetPasswordModel";
import { ResetPasswordContract } from "./resetPasswordContract";


export class ResetPasswordModelBinder implements IModelBinder<ResetPasswordModel> {
    public canHandleModel(model: Object): boolean {
        return model instanceof ResetPasswordModel;
    }

    public async contractToModel(contract: ResetPasswordContract): Promise<ResetPasswordModel> {
        return new ResetPasswordModel();
    }

    public canHandleContract(contract: Contract): boolean {
        return contract.type === "resetPassword";
    }

    public modelToContract(model: ResetPasswordModel): Contract {
        const contract: ResetPasswordContract = {
            type: "resetPassword"
        };

        return contract;
    }
}
