import { Bag } from "@paperbits/common";
import { EventManager } from "@paperbits/common/events";
import { IWidgetBinding } from "@paperbits/common/editing";
import { ViewModelBinder } from "@paperbits/common/widgets";
import { BemoDocumentationViewModel } from "./bemoDocumentationViewModel";
import { widgetName, widgetDisplayName, widgetEditorSelector } from "../constants";
import { BemoDocumentationModel } from "../bemoDocumentationModel";

export class BemoDocumentationViewModelBinder implements ViewModelBinder<BemoDocumentationModel, BemoDocumentationViewModel>  {
    constructor(private readonly eventManager: EventManager) { }

    public async updateViewModel(model: BemoDocumentationModel, viewModel: BemoDocumentationViewModel): Promise<void> {
        viewModel.runtimeConfig(JSON.stringify({ fileName: model.fileName }));
    }

    public async modelToViewModel(model: BemoDocumentationModel, viewModel?: BemoDocumentationViewModel, bindingContext?: Bag<any>): Promise<BemoDocumentationViewModel> {
        if (!viewModel) {
            viewModel = new BemoDocumentationViewModel();

            const binding: IWidgetBinding<BemoDocumentationModel, BemoDocumentationViewModel> = {
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

    public canHandleModel(model: BemoDocumentationModel): boolean {
        return model instanceof BemoDocumentationModel;
    }
}