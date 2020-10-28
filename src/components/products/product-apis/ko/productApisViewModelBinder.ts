import { Bag } from "@paperbits/common";
import { EventManager } from "@paperbits/common/events";
import { ViewModelBinder } from "@paperbits/common/widgets";
import { ProductApisViewModel } from "./productApisViewModel";
import { ProductApisModel } from "../productApisModel";

export class ProductApisViewModelBinder implements ViewModelBinder<ProductApisModel, ProductApisViewModel> {
    constructor(private readonly eventManager: EventManager) { }
    
    public async modelToViewModel(model: ProductApisModel, viewModel?: ProductApisViewModel, bindingContext?: Bag<any>): Promise<ProductApisViewModel> {
        if (!viewModel) {
            viewModel = new ProductApisViewModel();
        }

        viewModel.runtimeConfig(JSON.stringify({
            detailsPageUrl: model.detailsPageHyperlink
                ? model.detailsPageHyperlink.href
                : undefined
        }));

        viewModel["widgetBinding"] = {
            displayName: "Product: APIs",
            model: model,
            draggable: true,
            editor: "product-apis-editor",
            applyChanges: async (updatedModel: ProductApisModel) => {
                await this.modelToViewModel(updatedModel, viewModel, bindingContext);
                this.eventManager.dispatchEvent("onContentUpdate");
            }
        };

        return viewModel;
    }

    public canHandleModel(model: ProductApisModel): boolean {
        return model instanceof ProductApisModel;
    }
}