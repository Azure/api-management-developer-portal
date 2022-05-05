import { ViewModelBinder } from "@paperbits/common/widgets";
import { ProductDetailsViewModel } from "./productDetailsViewModel";
import { ProductDetailsModel } from "../productDetailsModel";
import { Bag } from "@paperbits/common";
import { ComponentFlow } from "@paperbits/common/editing";
import { StyleCompiler } from "@paperbits/common/styles";
import { ProductDetailsHandlers } from "../productDetailsHandlers";
import { EventManager, Events } from "@paperbits/common/events";

export class ProductDetailsViewModelBinder implements ViewModelBinder<ProductDetailsModel, ProductDetailsViewModel> {
    constructor(private readonly eventManager: EventManager,
        private readonly styleCompiler: StyleCompiler) { }

    public async modelToViewModel(model: ProductDetailsModel, viewModel?: ProductDetailsViewModel, bindingContext?: Bag<any>): Promise<ProductDetailsViewModel> {
        if (!viewModel) {
            viewModel = new ProductDetailsViewModel();
        }

        viewModel["widgetBinding"] = {
            displayName: "Product: Details",
            model: model,
            draggable: true,
            handler: ProductDetailsHandlers,
            flow: ComponentFlow.Block,
            applyChanges: async (updatedModel: ProductDetailsModel) => {
                await this.modelToViewModel(updatedModel, viewModel, bindingContext);
                this.eventManager.dispatchEvent(Events.ContentUpdate);
            }
        };

        if (model.styles) {
            viewModel.styles(await this.styleCompiler.getStyleModelAsync(model.styles, bindingContext?.styleManager, ProductDetailsHandlers));
        }

        return viewModel;
    }

    public canHandleModel(model: ProductDetailsModel): boolean {
        return model instanceof ProductDetailsModel;
    }
}