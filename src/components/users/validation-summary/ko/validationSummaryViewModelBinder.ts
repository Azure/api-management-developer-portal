import { Bag } from "@paperbits/common";
import { ComponentFlow } from "@paperbits/common/editing";
import { EventManager, Events } from "@paperbits/common/events";
import { StyleCompiler } from "@paperbits/common/styles";
import { ViewModelBinder } from "@paperbits/common/widgets";
import { ValidationSummaryHandlers } from "../validationSummaryHandlers";
import { ValidationSummaryModel } from "../validationSummaryModel";
import { ValidationSummaryViewModel } from "./validationSummaryViewModel";


export class ValidationSummaryViewModelBinder implements ViewModelBinder<ValidationSummaryModel, ValidationSummaryViewModel> {
    constructor(private readonly eventManager: EventManager,
        private readonly styleCompiler: StyleCompiler) { }
    public async modelToViewModel(model: ValidationSummaryModel, viewModel?: ValidationSummaryViewModel, bindingContext?: Bag<any>): Promise<ValidationSummaryViewModel> {
        if (!viewModel) {
            viewModel = new ValidationSummaryViewModel();

            viewModel["widgetBinding"] = {
                displayName: "Validation summary",
                layer: bindingContext?.layer,
                model: model,
                flow: ComponentFlow.Block,
                handler: ValidationSummaryHandlers,
                draggable: true,
                applyChanges: async (updatedModel: ValidationSummaryModel) => {
                    this.modelToViewModel(updatedModel, viewModel, bindingContext);
                    this.eventManager.dispatchEvent(Events.ContentUpdate);
                }
            };
        }

        if (model.styles) {
            viewModel.styles(await this.styleCompiler.getStyleModelAsync(model.styles, bindingContext?.styleManager, ValidationSummaryHandlers));
        }

        return viewModel;
    }

    public canHandleModel(model: ValidationSummaryModel): boolean {
        return model instanceof ValidationSummaryModel;
    }
}