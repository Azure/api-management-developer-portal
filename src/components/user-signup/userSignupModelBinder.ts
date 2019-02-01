import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { UserSignupModel } from "./userSignupModel";
import { UserSignupContract } from "./userSignupContract";


export class UserSignupModelBinder implements IModelBinder {
    constructor(
    ) {
        this.contractToModel = this.contractToModel.bind(this);
    }

    public canHandleWidgetType(widgetType: string): boolean {
        return widgetType === "userSignup";
    }

    public canHandleModel(model: Object): boolean {
        return model instanceof UserSignupModel;
    }

    public async contractToModel(contract: UserSignupContract): Promise<UserSignupModel> {
        return new UserSignupModel();
    }

    public modelToContract(searchResultModel: UserSignupModel): Contract {
        const contract: UserSignupContract = {
            object: "block",
            type: "userSignup"
        };

        return contract;
    }
}
