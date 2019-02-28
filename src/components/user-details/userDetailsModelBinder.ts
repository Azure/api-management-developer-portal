import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { UserDetailsModel } from "./userDetailsModel";
import { UserDetailsContract } from "./userDetailsContract";


export class UserDetailsModelBinder implements IModelBinder {
    public canHandleWidgetType(widgetType: string): boolean {
        return widgetType === "userDetails";
    }

    public canHandleModel(model: Object): boolean {
        return model instanceof UserDetailsModel;
    }

    public async contractToModel(contract: UserDetailsContract): Promise<UserDetailsModel> {
        return new UserDetailsModel();
    }

    public modelToContract(searchResultModel: UserDetailsModel): Contract {
        const contract: UserDetailsContract = {
            object: "block",
            type: "userDetails"
        };

        return contract;
    }
}
