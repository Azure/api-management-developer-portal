import { IModelBinder } from "@paperbits/common/editing";
import { DocumentDetailsModel } from "./documentDetailsModel";
import { Contract } from "@paperbits/common";
import { widgetName, defaultFileName } from "./constants";
import { DocumentDetailsContract } from "./documentDetailsContract";


export class DocumentDetailsModelBinder implements IModelBinder<DocumentDetailsModel> {
    public canHandleContract(contract: Contract): boolean {
        return contract.type === widgetName;
    }

    public canHandleModel(model: DocumentDetailsModel): boolean {
        return model instanceof DocumentDetailsModel;
    }

    public async contractToModel(contract: DocumentDetailsContract): Promise<DocumentDetailsModel> {
        const model = new DocumentDetailsModel();
        model.fileName = contract.fileName || defaultFileName;
        return model;
    }

    public modelToContract(model: DocumentDetailsModel): Contract {
        const contract: DocumentDetailsContract = {
            type: widgetName,
            fileName: model.fileName
        };

        return contract;
    }
}
