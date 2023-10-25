import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { SigninModel } from "./signinModel";
import { SigninContract } from "./signinContract";


const nodeType = "signin";

export class SigninModelBinder implements IModelBinder<SigninModel> {
    public async contractToModel(contract: SigninContract): Promise<SigninModel> {
        const model = new SigninModel();
        model.styles = contract.styles ?? {};

        return model;
    }

    public modelToContract(model: SigninModel): Contract {
        const contract: SigninContract = {
            type: nodeType,
            styles: model.styles
        };

        return contract;
    }
}
