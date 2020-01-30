import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { ProfileModel } from "./profileModel";
import { ProfileContract } from "./profileContract";


const nodeType = "profile";
const oldNodeType = "userDetails";

export class ProfileModelBinder implements IModelBinder<ProfileModel> {
    public canHandleModel(model: Object): boolean {
        return model instanceof ProfileModel;
    }

    public canHandleContract(contract: Contract): boolean {
        return contract.type === nodeType || contract.type === oldNodeType;
    }

    public async contractToModel(contract: ProfileContract): Promise<ProfileModel> {
        return new ProfileModel();
    }

    public modelToContract(model: ProfileModel): Contract {
        const contract: ProfileContract = {
            type: nodeType
        };

        return contract;
    }
}
