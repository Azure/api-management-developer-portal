import { ViewModelBinder } from "@paperbits/common/widgets";
import { ProductDetailsViewModel } from "./productDetailsViewModel";
import { ProductDetailsModel } from "../productDetailsModel";
import { Bag } from "@paperbits/common";

export class ProductDetailsViewModelBinder implements ViewModelBinder<ProductDetailsModel, ProductDetailsViewModel> {
    public async modelToViewModel(model: ProductDetailsModel, viewModel?: ProductDetailsViewModel, bindingContext?: Bag<any>): Promise<ProductDetailsViewModel> {
        if (!viewModel) {
            viewModel = new ProductDetailsViewModel();
        }

        viewModel["widgetBinding"] = {
            displayName: "Product: Details",
            model: model,
            draggable: true,
            flow: "block",
        };

        return viewModel;
    }

    public canHandleModel(model: ProductDetailsModel): boolean {
        return model instanceof ProductDetailsModel;
    }
}