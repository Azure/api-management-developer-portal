import { ViewModelBinder } from "@paperbits/common/widgets";
import { ProductApisViewModel } from "./productApisViewModel";
import { ProductApisModel } from "../productApisModel";
import { Bag } from "@paperbits/common";

export class ProductApisViewModelBinder implements ViewModelBinder<ProductApisModel, ProductApisViewModel> {
    public async modelToViewModel(model: ProductApisModel, viewModel?: ProductApisViewModel, bindingContext?: Bag<any>): Promise<ProductApisViewModel> {
        if (!viewModel) {
            viewModel = new ProductApisViewModel();
        }

        viewModel["widgetBinding"] = {
            displayName: "Product: APIs",
            model: model,
            applyChanges: async (updatedModel: ProductApisModel) => {
                this.modelToViewModel(updatedModel, viewModel, bindingContext);
            }
        };

        return viewModel;
    }

    public canHandleModel(model: ProductApisModel): boolean {
        return model instanceof ProductApisModel;
    }
}