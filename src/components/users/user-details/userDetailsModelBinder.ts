import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { UserDetailsModel } from "./userDetailsModel";
import { UserDetailsContract } from "./userDetailsContract";


export class UserDetailsModelBinder implements IModelBinder {
    public canHandleModel(model: Object): boolean {
        return model instanceof UserDetailsModel;
    }

    public canHandleContract(contract: Contract): boolean {
        return contract.type === "userDetails";
    }

    public async contractToModel(contract: UserDetailsContract): Promise<UserDetailsModel> {
        return new UserDetailsModel();
    }

    public modelToContract(searchResultModel: UserDetailsModel): Contract {
        const contract: UserDetailsContract = {
            type: "userDetails"
        };

        return contract;
    }
}
