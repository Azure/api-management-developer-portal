import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { OperationDetailsModel } from "./operationDetailsModel";
import { OperationDetailsContract } from "./operationDetailsContract";

export class OperationDetailsModelBinder implements IModelBinder<OperationDetailsModel> {
    public canHandleContract(contract: Contract): boolean {
        return contract.type === "operationDetails";
    }

    public canHandleModel(model: Object): boolean {
        return model instanceof OperationDetailsModel;
    }

    public async contractToModel(contract: OperationDetailsContract): Promise<OperationDetailsModel> {
        return new OperationDetailsModel();
    }

    public modelToContract(model: OperationDetailsModel): Contract {
        const contract: OperationDetailsContract = {
            type: "operationDetails"
        };

        return contract;
    }
}
