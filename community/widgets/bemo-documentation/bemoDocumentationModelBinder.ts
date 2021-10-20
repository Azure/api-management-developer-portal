import { IModelBinder } from "@paperbits/common/editing";
import { BemoDocumentationModel } from "./bemoDocumentationModel";
import { Contract } from "@paperbits/common";
import { widgetName, defaultFileName } from "./constants";
import { BemoDocumentationContract } from "./bemoDocumentationContract";

export class BemoDocumentationModelBinder implements IModelBinder<BemoDocumentationModel> {
    public canHandleContract(contract: Contract): boolean {
        return contract.type === widgetName;
    }

    public canHandleModel(model: BemoDocumentationModel): boolean {
        return model instanceof BemoDocumentationModel;
    }

    public async contractToModel(contract: BemoDocumentationContract): Promise<BemoDocumentationModel> {
        const model = new BemoDocumentationModel();
        model.fileName = contract.fileName || defaultFileName;
        return model;
    }

    public modelToContract(model: BemoDocumentationModel): Contract {
        const contract:BemoDocumentationContract = {
            type: widgetName,
            fileName: model.fileName
        };

        return contract;
    }
}
