import { ViewModelBinder } from "@paperbits/common/widgets";
import { ProductSubscribeViewModel } from "./productSubscribeViewModel";
import { ProductSubscribeModel } from "../productSubscribeModel";
import { Bag } from "@paperbits/common";

export class ProductSubscribeViewModelBinder implements ViewModelBinder<ProductSubscribeModel, ProductSubscribeViewModel> {
    public async modelToViewModel(model: ProductSubscribeModel, viewModel?: ProductSubscribeViewModel, bindingContext?: Bag<any>): Promise<ProductSubscribeViewModel> {
        if (!viewModel) {
            viewModel = new ProductSubscribeViewModel();
        }

        viewModel["widgetBinding"] = {
            displayName: "Product: Subscribe form",
            model: model,
            flow: "block",
            applyChanges: async (updatedModel: ProductSubscribeModel) => {
                this.modelToViewModel(updatedModel, viewModel, bindingContext);
            }
        };

        return viewModel;
    }

    public canHandleModel(model: ProductSubscribeModel): boolean {
        return model instanceof ProductSubscribeModel;
    }
}