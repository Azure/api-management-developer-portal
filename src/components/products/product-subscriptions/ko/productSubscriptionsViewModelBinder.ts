import { ViewModelBinder } from "@paperbits/common/widgets";
import { ProductSubscriptionsViewModel } from "./productSubscriptionsViewModel";
import { ProductSubscriptionsModel } from "../productSubscriptionsModel";
import { Bag } from "@paperbits/common";
import { ComponentFlow } from "@paperbits/common/editing";
import { StyleCompiler } from "@paperbits/common/styles";
import { ProductSubscriptionsHandlers } from "../productSubscriptionsHandlers";
import { EventManager, Events } from "@paperbits/common/events";

export class ProductSubscriptionsViewModelBinder implements ViewModelBinder<ProductSubscriptionsModel, ProductSubscriptionsViewModel> {
    constructor(
        private readonly eventManager: EventManager,
        private readonly styleCompiler: StyleCompiler) { }
    public async modelToViewModel(model: ProductSubscriptionsModel, viewModel?: ProductSubscriptionsViewModel, bindingContext?: Bag<any>): Promise<ProductSubscriptionsViewModel> {
        if (!viewModel) {
            viewModel = new ProductSubscriptionsViewModel();

            viewModel["widgetBinding"] = {
                displayName: "Product: Subscriptions",
                model: model,
                flow: ComponentFlow.Block,
                draggable: true,
                handler: ProductSubscriptionsHandlers,
                applyChanges: async (updatedModel: ProductSubscriptionsModel) => {
                    await this.modelToViewModel(updatedModel, viewModel, bindingContext);
                    this.eventManager.dispatchEvent(Events.ContentUpdate);
                }
            };
        }

        if (model.styles) {
            viewModel.styles(await this.styleCompiler.getStyleModelAsync(model.styles, bindingContext?.styleManager, ProductSubscriptionsHandlers));
        }

        return viewModel;
    }

    public canHandleModel(model: ProductSubscriptionsModel): boolean {
        return model instanceof ProductSubscriptionsModel;
    }
}