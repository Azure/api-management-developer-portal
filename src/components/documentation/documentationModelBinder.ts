import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { DocumentationModel } from "./documentationModel";
import { DocumentationContract } from "./documentationContract";


export class DocumentationModelBinder implements IModelBinder {
    constructor(
    ) {
        this.contractToModel = this.contractToModel.bind(this);
    }

    public canHandleWidgetType(widgetType: string): boolean {
        return widgetType === "documentation";
    }

    public canHandleModel(model: Object): boolean {
        return model instanceof DocumentationModel;
    }

    public async contractToModel(contract: DocumentationContract): Promise<DocumentationModel> {
        return new DocumentationModel();
    }

    public modelToContract(searchResultModel: DocumentationModel): Contract {
        const searchResultConfig: DocumentationContract = {
            object: "block",
            type: "documentation"
        };

        return searchResultConfig;
    }
}
