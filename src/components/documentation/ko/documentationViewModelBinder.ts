import { IViewModelBinder } from "@paperbits/common/widgets";
import { DocumentationViewModel } from "./documentationViewModel";
import { DocumentationModel } from "../documentationModel";


export class DocumentationViewModelBinder implements IViewModelBinder<DocumentationModel, DocumentationViewModel> {
    public modelToViewModel(model: DocumentationModel, readonly: boolean, viewModel?: DocumentationViewModel): DocumentationViewModel {
        if (!viewModel) {
            viewModel = new DocumentationViewModel();
        }

        viewModel["widgetBinding"] = {
            name: "Search results",
            readonly: readonly,
            model: model,
            applyChanges: async (updatedModel: DocumentationModel) => {
                Object.assign(model, updatedModel);
                this.modelToViewModel(model, readonly, viewModel);
            }
        }

        return viewModel;
    }

    public canHandleModel(model: DocumentationModel): boolean {
        return model instanceof DocumentationModel;
    }
}