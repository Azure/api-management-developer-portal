import { ViewModelBinder } from "@paperbits/common/widgets";
import { ProductSubscribeViewModel } from "./productSubscribeViewModel";
import { ProductSubscribeModel } from "../productSubscribeModel";
import { Bag } from "@paperbits/common";
import { EventManager, Events } from "@paperbits/common/events";
import { ComponentFlow } from "@paperbits/common/editing";
import { StyleCompiler } from "@paperbits/common/styles";
import { ProductSubscribeHandlers } from "../productSubscribeHandlers";



export class ProductSubscribeViewModelBinder implements ViewModelBinder<ProductSubscribeModel, ProductSubscribeViewModel> {
    constructor(
        private readonly eventManager: EventManager,
        private readonly styleCompiler: StyleCompiler) { }

    public async modelToViewModel(model: ProductSubscribeModel, viewModel?: ProductSubscribeViewModel, bindingContext?: Bag<any>): Promise<ProductSubscribeViewModel> {
        if (!viewModel) {
            viewModel = new ProductSubscribeViewModel();
        }

        viewModel.runtimeConfig(JSON.stringify({
            showTermsByDefault: model.showTermsByDefault
        }));

        viewModel["widgetBinding"] = {
            displayName: "Product: Subscribe form",
            layer: bindingContext?.layer,
            model: model,
            flow: ComponentFlow.Block,
            editor: "product-subscribe-editor",
            handler: ProductSubscribeHandlers,
            applyChanges: async (updatedModel: ProductSubscribeModel) => {
                this.modelToViewModel(updatedModel, viewModel, bindingContext);
                this.eventManager.dispatchEvent(Events.ContentUpdate);
            }
        };

        if (model.styles) {
            viewModel.styles(await this.styleCompiler.getStyleModelAsync(model.styles, bindingContext?.styleManager, ProductSubscribeHandlers));
        }

        return viewModel;
    }

    public canHandleModel(model: ProductSubscribeModel): boolean {
        return model instanceof ProductSubscribeModel;
    }
}