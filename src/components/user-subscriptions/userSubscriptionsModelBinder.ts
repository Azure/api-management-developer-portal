import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { UserSubscriptionsModel } from "./userSubscriptionsModel";
import { UserSubscriptionsContract } from "./userSubscriptionsContract";


export class UserSubscriptionsModelBinder implements IModelBinder {
    public canHandleWidgetType(widgetType: string): boolean {
        return widgetType === "userSubscriptions";
    }

    public canHandleModel(model: Object): boolean {
        return model instanceof UserSubscriptionsModel;
    }

    public async contractToModel(contract: UserSubscriptionsContract): Promise<UserSubscriptionsModel> {
        return new UserSubscriptionsModel();
    }

    public modelToContract(searchResultModel: UserSubscriptionsModel): Contract {
        const contract: UserSubscriptionsContract = {
            object: "block",
            type: "userSubscriptions"
        };

        return contract;
    }
}
