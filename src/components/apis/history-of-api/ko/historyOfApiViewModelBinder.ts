import { ViewModelBinder } from "@paperbits/common/widgets";
import { HistoryOfApiViewModel } from "./historyOfApiViewModel";
import { HistoryOfApiModel } from "../historyOfApiModel";
import { Bag } from "@paperbits/common";
import { EventManager, Events } from "@paperbits/common/events";
import { ComponentFlow } from "@paperbits/common/editing";
import { StyleCompiler } from "@paperbits/common/styles";
import { HistoryOfApiHandlers } from "../historyOfApiHandlers";


export class HistoryOfApiViewModelBinder implements ViewModelBinder<HistoryOfApiModel, HistoryOfApiViewModel> {

    constructor(private readonly eventManager: EventManager,
        private readonly styleCompiler: StyleCompiler) { }

    public async modelToViewModel(model: HistoryOfApiModel, viewModel?: HistoryOfApiViewModel, bindingContext?: Bag<any>): Promise<HistoryOfApiViewModel> {
        if (!viewModel) {
            viewModel = new HistoryOfApiViewModel();
        }

        viewModel.runtimeConfig(JSON.stringify({
            detailsPageUrl: model.detailsPageHyperlink
                ? model.detailsPageHyperlink.href
                : undefined
        }));

        viewModel["widgetBinding"] = {
            displayName: "API: Change history",
            layer: bindingContext?.layer,
            model: model,
            draggable: true,
            flow: ComponentFlow.Block,
            editor: "history-of-api-editor",
            handler: HistoryOfApiHandlers,
            applyChanges: async (updatedModel: HistoryOfApiModel) => {
                await this.modelToViewModel(updatedModel, viewModel, bindingContext);
                this.eventManager.dispatchEvent(Events.ContentUpdate);
            }
        };

        if (model.styles) {
            viewModel.styles(await this.styleCompiler.getStyleModelAsync(model.styles, bindingContext?.styleManager, HistoryOfApiHandlers));
        }

        return viewModel;
    }

    public canHandleModel(model: HistoryOfApiModel): boolean {
        return model instanceof HistoryOfApiModel;
    }
}