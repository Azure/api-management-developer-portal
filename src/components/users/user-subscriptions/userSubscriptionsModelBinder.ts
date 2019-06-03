import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { UserSubscriptionsModel } from "./userSubscriptionsModel";
import { UserSubscriptionsContract } from "./userSubscriptionsContract";


export class UserSubscriptionsModelBinder implements IModelBinder<UserSubscriptionsModel> {
    public canHandleModel(model: Object): boolean {
        return model instanceof UserSubscriptionsModel;
    }

    public canHandleContract(contract: Contract): boolean {
        return contract.type === "userSubscriptions";
    }

    public async contractToModel(contract: UserSubscriptionsContract): Promise<UserSubscriptionsModel> {
        return new UserSubscriptionsModel();
    }

    public modelToContract(searchResultModel: UserSubscriptionsModel): Contract {
        const contract: UserSubscriptionsContract = {
            type: "userSubscriptions"
        };

        return contract;
    }
}
