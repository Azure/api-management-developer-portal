import { ViewModelBinder } from "@paperbits/common/widgets";
import { ReportsViewModel } from "./reportsViewModel";
import { ReportsModel } from "../reportsModel";
import { Bag } from "@paperbits/common";
import { ComponentFlow } from "@paperbits/common/editing";
import { EventManager, Events } from "@paperbits/common/events";
import { StyleCompiler } from "@paperbits/common/styles";
import { ReportsHandlers } from "../reportsHandlers";

export class ReportsViewModelBinder implements ViewModelBinder<ReportsModel, ReportsViewModel> {
    constructor(
        private readonly eventManager: EventManager,
        private readonly styleCompiler: StyleCompiler) { }

    public async modelToViewModel(model: ReportsModel, viewModel?: ReportsViewModel, bindingContext?: Bag<any>): Promise<ReportsViewModel> {
        if (!viewModel) {
            viewModel = new ReportsViewModel();
        }

        viewModel["widgetBinding"] = {
            displayName: "Reports",
            layer: bindingContext?.layer,
            model: model,
            flow: ComponentFlow.Block,
            draggable: true,
            handler: ReportsHandlers,
            applyChanges: async (updatedModel: ReportsModel) => {
                this.modelToViewModel(updatedModel, viewModel, bindingContext);
                this.eventManager.dispatchEvent(Events.ContentUpdate);
            }
        };

        if (model.styles) {
            viewModel.styles(await this.styleCompiler.getStyleModelAsync(model.styles, bindingContext?.styleManager, ReportsHandlers));
        }

        return viewModel;
    }

    public canHandleModel(model: ReportsModel): boolean {
        return model instanceof ReportsModel;
    }
}