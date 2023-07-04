import { Bag } from "@paperbits/common";
import { ComponentFlow } from "@paperbits/common/components";
import { EventManager, Events } from "@paperbits/common/events";
import { StyleCompiler } from "@paperbits/common/styles";
import { ViewModelBinder } from "@paperbits/common/widgets";
import { ProductDetailsPageHandlers } from "../productDetailsPageHandlers";
import { ProductDetailsPageModel } from "../productDetailsPageModel";
import { ProductDetailsPageViewModel } from "./productDetailsPageViewModel";

export class ProductDetailsPageViewModelBinder implements ViewModelBinder<ProductDetailsPageModel, ProductDetailsPageViewModel> {
    constructor(
        private readonly eventManager: EventManager,
        private readonly styleCompiler: StyleCompiler) { }

    public async modelToViewModel(model: ProductDetailsPageModel, viewModel?: ProductDetailsPageViewModel, bindingContext?: Bag<any>): Promise<ProductDetailsPageViewModel> {
        if (!viewModel) {
            viewModel = new ProductDetailsPageViewModel();
        }

        viewModel.runtimeConfig(JSON.stringify({
            wrapText: model.wrapText
        }));

        viewModel["widgetBinding"] = {
            displayName: "Product Details Page",
            layer: bindingContext?.layer,
            model: model,
            draggable: true,
            flow: ComponentFlow.Block,
            editor: "product-details-page-editor",
            handler: ProductDetailsPageHandlers,
            applyChanges: async (updatedModel: ProductDetailsPageModel) => {
                await this.modelToViewModel(updatedModel, viewModel, bindingContext);
                this.eventManager.dispatchEvent(Events.ContentUpdate);
            }
        };

        if (model.styles) {
            viewModel.styles(await this.styleCompiler.getStyleModelAsync(model.styles, bindingContext?.styleManager, ProductDetailsPageHandlers));
        }

        return viewModel;
    }

    public canHandleModel(model: ProductDetailsPageModel): boolean {
        return model instanceof ProductDetailsPageModel;
    }
}