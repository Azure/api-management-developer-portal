import { Bag } from "@paperbits/common";
import { ComponentFlow } from "@paperbits/common/components";
import { EventManager, Events } from "@paperbits/common/events";
import { StyleCompiler } from "@paperbits/common/styles";
import { ViewModelBinder } from "@paperbits/common/widgets";
import { ApiDetailsPageHandlers } from "../apiDetailsPageHandlers";
import { ApiDetailsPageModel } from "../apiDetailsPageModel";
import { ApiDetailsPageViewModel } from "./apiDetailsPageViewModel";

export class ApiDetailsPageViewModelBinder implements ViewModelBinder<ApiDetailsPageModel, ApiDetailsPageViewModel> {
    constructor(
        private readonly eventManager: EventManager,
        private readonly styleCompiler: StyleCompiler) { }

    public async modelToViewModel(model: ApiDetailsPageModel, viewModel?: ApiDetailsPageViewModel, bindingContext?: Bag<any>): Promise<ApiDetailsPageViewModel> {
        if (!viewModel) {
            viewModel = new ApiDetailsPageViewModel();
        }

        viewModel.runtimeConfig(JSON.stringify({
            groupOperationsByTag: model.groupOperationsByTag,
            showUrlPath: model.showUrlPath,
            wrapText: model.wrapText,
            enableConsole: model.enableConsole
        }));

        viewModel["widgetBinding"] = {
            displayName: "API Details Page",
            layer: bindingContext?.layer,
            model: model,
            draggable: true,
            flow: ComponentFlow.Block,
            editor: "api-details-page-editor",
            handler: ApiDetailsPageHandlers,
            applyChanges: async (updatedModel: ApiDetailsPageModel) => {
                await this.modelToViewModel(updatedModel, viewModel, bindingContext);
                this.eventManager.dispatchEvent(Events.ContentUpdate);
            }
        };

        if (model.styles) {
            viewModel.styles(await this.styleCompiler.getStyleModelAsync(model.styles, bindingContext?.styleManager, ApiDetailsPageHandlers));
        }

        return viewModel;
    }

    public canHandleModel(model: ApiDetailsPageModel): boolean {
        return model instanceof ApiDetailsPageModel;
    }
}