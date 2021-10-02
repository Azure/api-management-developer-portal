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
        const model = new OperationDetailsModel();
        model.enableConsole = contract.enableConsole === true || contract.enableConsole === undefined;
        model.enableScrollTo = contract.enableScrollTo !== undefined && contract.enableScrollTo === true;
        model.defaultSchemaView = contract.defaultSchemaView || "table";
        model.useCorsProxy = contract.useCorsProxy;

        return model;
    }

    public modelToContract(model: OperationDetailsModel): Contract {
        const contract: OperationDetailsContract = {
            type: "operationDetails",
            enableConsole: model.enableConsole,
            enableScrollTo: model.enableScrollTo,
            defaultSchemaView: model.defaultSchemaView,
            useCorsProxy: model.useCorsProxy
        };

        return contract;
    }
}
