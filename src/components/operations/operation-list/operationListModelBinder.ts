import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { OperationListModel } from "./operationListModel";
import { OperationListContract } from "./operationListContract";

export class OperationListModelBinder implements IModelBinder<OperationListModel> {
    public canHandleContract(contract: Contract): boolean {
        return contract.type === "operationList";
    }

    public canHandleModel(model: Object): boolean {
        return model instanceof OperationListModel;
    }

    public async contractToModel(contract: OperationListContract): Promise<OperationListModel> {
        return new OperationListModel();
    }

    public modelToContract(model: OperationListModel): Contract {
        const contract: OperationListContract = {
            type: "operationList"
        };

        return contract;
    }
}
