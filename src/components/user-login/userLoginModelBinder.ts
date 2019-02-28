import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { UserLoginModel } from "./userLoginModel";
import { UserLoginContract } from "./userLoginContract";


export class UserLoginModelBinder implements IModelBinder {
    public canHandleWidgetType(widgetType: string): boolean {
        return widgetType === "userLogin";
    }

    public canHandleModel(model: Object): boolean {
        return model instanceof UserLoginModel;
    }

    public async contractToModel(contract: UserLoginContract): Promise<UserLoginModel> {
        return new UserLoginModel();
    }

    public modelToContract(searchResultModel: UserLoginModel): Contract {
        const contract: UserLoginContract = {
            object: "block",
            type: "userLogin"
        };

        return contract;
    }
}
