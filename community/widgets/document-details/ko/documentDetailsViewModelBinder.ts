import { Bag } from "@paperbits/common";
import { EventManager } from "@paperbits/common/events";
import { IWidgetBinding } from "@paperbits/common/editing";
import { ViewModelBinder } from "@paperbits/common/widgets";
import { DocumentDetailsViewModel } from "./documentDetailsViewModel";
import { widgetName, widgetDisplayName, widgetEditorSelector } from "../constants";
import { DocumentDetailsModel } from "../documentDetailsModel";


export class DocumentDetailsViewModelBinder implements ViewModelBinder<DocumentDetailsModel, DocumentDetailsViewModel>  {
    constructor(private readonly eventManager: EventManager) { }

    public async updateViewModel(model: DocumentDetailsModel, viewModel: DocumentDetailsViewModel): Promise<void> {
        viewModel.runtimeConfig(JSON.stringify({ fileName: model.fileName }));
    }

    public async modelToViewModel(model: DocumentDetailsModel, viewModel?: DocumentDetailsViewModel, bindingContext?: Bag<any>): Promise<DocumentDetailsViewModel> {
        if (!viewModel) {
            viewModel = new DocumentDetailsViewModel();

            const binding: IWidgetBinding<DocumentDetailsModel, DocumentDetailsViewModel> = {
                name: widgetName,
                displayName: widgetDisplayName,
                readonly: bindingContext?.readonly,
                model: model,
                flow: "block",
                editor: widgetEditorSelector,
                draggable: true,
                applyChanges: async () => {
                    await this.updateViewModel(model, viewModel);
                    this.eventManager.dispatchEvent("onContentUpdate");
                }
            };
            viewModel["widgetBinding"] = binding;
        }

        this.updateViewModel(model, viewModel);

        return viewModel;
    }

    public canHandleModel(model: DocumentDetailsModel): boolean {
        return model instanceof DocumentDetailsModel;
    }
}