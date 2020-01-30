import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { SubscriptionsModel } from "./subscriptionsModel";
import { SubscriptionsContract } from "./subscriptionsContract";


const nodeType = "subscriptions";
const oldNodeType = "userSubscriptions";

export class SubscriptionsModelBinder implements IModelBinder<SubscriptionsModel> {
    public canHandleModel(model: Object): boolean {
        return model instanceof SubscriptionsModel;
    }

    public canHandleContract(contract: Contract): boolean {
        return contract.type === nodeType || contract.type === oldNodeType;
    }

    public async contractToModel(contract: SubscriptionsContract): Promise<SubscriptionsModel> {
        return new SubscriptionsModel();
    }

    public modelToContract(model: SubscriptionsModel): Contract {
        const contract: SubscriptionsContract = {
            type: nodeType
        };

        return contract;
    }
}
