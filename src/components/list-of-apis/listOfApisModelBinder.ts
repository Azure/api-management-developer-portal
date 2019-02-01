import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { ListOfApisModel } from "./listOfApisModel";
import { ListOfApisContract } from "./listOfApisContract";


export class ListOfApisModelBinder implements IModelBinder {
    constructor(
    ) {
        this.contractToModel = this.contractToModel.bind(this);
    }

    public canHandleWidgetType(widgetType: string): boolean {
        return widgetType === "listOfApis";
    }

    public canHandleModel(model: Object): boolean {
        return model instanceof ListOfApisModel;
    }

    public async contractToModel(contract: ListOfApisContract): Promise<ListOfApisModel> {
        return new ListOfApisModel();
    }

    public modelToContract(searchResultModel: ListOfApisModel): Contract {
        const searchResultConfig: ListOfApisContract = {
            object: "block",
            type: "listOfApis"
        };

        return searchResultConfig;
    }
}
