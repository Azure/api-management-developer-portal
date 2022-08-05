import { ViewModelBinder } from "@paperbits/common/widgets";
import { Bag } from "@paperbits/common";
import { EventManager, Events } from "@paperbits/common/events";
import { ComponentFlow } from "@paperbits/common/editing";
import { MarkdownModel } from "../markdownModel";
import { MarkdownViewModel } from "./markdownViewModel";
import { MarkdownHandlers } from "../markdownHandlers";

export class MarkdownViewModelBinder implements ViewModelBinder<MarkdownModel, MarkdownViewModel> {

    constructor(private readonly eventManager: EventManager) { }

    public async modelToViewModel(model: MarkdownModel, viewModel?: MarkdownViewModel, bindingContext?: Bag<any>): Promise<MarkdownViewModel> {
        if (!viewModel) {
            viewModel = new MarkdownViewModel();
        }

        const runtimeConfig = {
            compiledContent: model.compiledContent,
        }
        viewModel.id(model.id);
        viewModel.runtimeConfig(JSON.stringify(runtimeConfig));

        viewModel["widgetBinding"] = {
            displayName: "Markdown",
            layer: bindingContext?.layer,
            model: model,
            draggable: true,
            flow: ComponentFlow.Block,
            editor: "markdown-editor",
            handler: MarkdownHandlers,
            applyChanges: async (updatedModel: MarkdownModel) => {
                await this.modelToViewModel(updatedModel, viewModel, bindingContext);
                this.eventManager.dispatchEvent(Events.ContentUpdate);
            }
        };
        return viewModel;
    }


    public canHandleModel(model: MarkdownModel): boolean {
        return model instanceof MarkdownModel;
    }
}