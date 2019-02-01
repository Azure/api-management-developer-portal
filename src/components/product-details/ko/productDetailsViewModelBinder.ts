import { IViewModelBinder } from "@paperbits/common/widgets";
import { ProductDetailsViewModel } from "./productDetailsViewModel";
import { ProductDetailsModel } from "../productDetailsModel";

export class ProductDetailsViewModelBinder implements IViewModelBinder<ProductDetailsModel, ProductDetailsViewModel> {
    public modelToViewModel(model: ProductDetailsModel, readonly: boolean, viewModel?: ProductDetailsViewModel): ProductDetailsViewModel {
        if (!viewModel) {
            viewModel = new ProductDetailsViewModel();
        }

        viewModel["widgetBinding"] = {
            displayName: "Product details",
            readonly: readonly,
            model: model,
            applyChanges: async (updatedModel: ProductDetailsModel) => {
                Object.assign(model, updatedModel);
                this.modelToViewModel(model, readonly, viewModel);
            }
        }

        return viewModel;
    }

    public canHandleModel(model: ProductDetailsModel): boolean {
        return model instanceof ProductDetailsModel;
    }
}