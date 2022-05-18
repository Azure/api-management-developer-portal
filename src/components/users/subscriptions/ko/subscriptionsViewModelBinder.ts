import { Bag } from "@paperbits/common";
import { ComponentFlow } from "@paperbits/common/editing";
import { EventManager, Events } from "@paperbits/common/events";
import { StyleCompiler } from "@paperbits/common/styles";
import { ViewModelBinder } from "@paperbits/common/widgets";
import { SubscriptionsHandlers } from "../subscriptionsHandlers";
import { SubscriptionsModel } from "../subscriptionsModel";
import { SubscriptionsViewModel } from "./subscriptionsViewModel";


export class SubscriptionsViewModelBinder implements ViewModelBinder<SubscriptionsModel, SubscriptionsViewModel> {
    constructor(
        private readonly eventManager: EventManager,
        private readonly styleCompiler: StyleCompiler) { }

    public async modelToViewModel(model: SubscriptionsModel, viewModel?: SubscriptionsViewModel, bindingContext?: Bag<any>): Promise<SubscriptionsViewModel> {
        if (!viewModel) {
            viewModel = new SubscriptionsViewModel();

            viewModel["widgetBinding"] = {
                displayName: "User: Subscriptions",
                model: model,
                flow: ComponentFlow.Block,
                draggable: true,
                handler: SubscriptionsHandlers,
                applyChanges: async (updatedModel: SubscriptionsModel) => {
                    await this.modelToViewModel(updatedModel, viewModel, bindingContext);
                    this.eventManager.dispatchEvent(Events.ContentUpdate);
                }
            };
        }

        if (model.styles) {
            viewModel.styles(await this.styleCompiler.getStyleModelAsync(model.styles, bindingContext?.styleManager, SubscriptionsHandlers));
        }


        return viewModel;
    }

    public canHandleModel(model: SubscriptionsModel): boolean {
        return model instanceof SubscriptionsModel;
    }
}