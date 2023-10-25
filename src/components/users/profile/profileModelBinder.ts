import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { ProfileModel } from "./profileModel";
import { ProfileContract } from "./profileContract";


const nodeType = "profile";

export class ProfileModelBinder implements IModelBinder<ProfileModel> {
    public async contractToModel(contract: ProfileContract): Promise<ProfileModel> {
        const model = new ProfileModel();
        model.styles = contract.styles ?? {};

        return model;
    }

    public modelToContract(model: ProfileModel): Contract {
        const contract: ProfileContract = {
            type: nodeType,
            styles: model.styles
        };

        return contract;
    }
}
