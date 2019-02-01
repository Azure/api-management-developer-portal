import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { DetailsOfApiModel } from "./detailsOfApiModel";
import { DetailsOfApiContract } from "./detailsOfApiContract";


export class DetailsOfApiModelBinder implements IModelBinder {
    constructor(
    ) {
        this.contractToModel = this.contractToModel.bind(this);
    }

    public canHandleWidgetType(widgetType: string): boolean {
        return widgetType === "detailsOfApi";
    }

    public canHandleModel(model: Object): boolean {
        return model instanceof DetailsOfApiModel;
    }

    public async contractToModel(contract: DetailsOfApiContract): Promise<DetailsOfApiModel> {
        return new DetailsOfApiModel();
    }

    public modelToContract(searchResultModel: DetailsOfApiModel): Contract {
        const searchResultConfig: DetailsOfApiContract = {
            object: "block",
            type: "detailsOfApi"
        };

        return searchResultConfig;
    }
}
