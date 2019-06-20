import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { UserSigninModel } from "./userSigninModel";
import { UserSigninContract } from "./userSigninContract";


export class UserSigninModelBinder implements IModelBinder<UserSigninModel> {
    public canHandleModel(model: Object): boolean {
        return model instanceof UserSigninModel;
    }

    public async contractToModel(contract: UserSigninContract): Promise<UserSigninModel> {
        return new UserSigninModel();
    }

    public canHandleContract(contract: Contract): boolean {
        return contract.type === "userSignin";
    }

    public modelToContract(model: UserSigninModel): Contract {
        const contract: UserSigninContract = {
            type: "userSignin"
        };

        return contract;
    }
}
