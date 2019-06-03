import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { ListOfApisModel } from "./listOfApisModel";
import { ListOfApisContract } from "./listOfApisContract";


export class ListOfApisModelBinder implements IModelBinder<ListOfApisModel> {
    public canHandleModel(model: Object): boolean {
        return model instanceof ListOfApisModel;
    }

    public async contractToModel(contract: ListOfApisContract): Promise<ListOfApisModel> {
        const model = new ListOfApisModel();
        model.itemStyleView = contract.itemStyleView;
        return model;
    }

    public canHandleContract(contract: Contract): boolean {
        return contract.type === "listOfApis";
    }

    public modelToContract(model: ListOfApisModel): Contract {
        const contract: ListOfApisContract = {
            type: "listOfApis",
            itemStyleView: model.itemStyleView
        };

        return contract;
    }
}
