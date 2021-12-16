import { ViewModelBinder } from "@paperbits/common/widgets";
import { ProductDetailsViewModel } from "./productDetailsViewModel";
import { ProductDetailsModel } from "../productDetailsModel";
import { Bag } from "@paperbits/common";
import { ComponentFlow } from "@paperbits/common/editing";

export class ProductDetailsViewModelBinder implements ViewModelBinder<ProductDetailsModel, ProductDetailsViewModel> {
    public async modelToViewModel(model: ProductDetailsModel, viewModel?: ProductDetailsViewModel, bindingContext?: Bag<any>): Promise<ProductDetailsViewModel> {
        if (!viewModel) {
            viewModel = new ProductDetailsViewModel();
        }

        viewModel["widgetBinding"] = {
            displayName: "Product: Details",
            model: model,
            draggable: true,
            flow: ComponentFlow.Block,
        };

        return viewModel;
    }

    public canHandleModel(model: ProductDetailsModel): boolean {
        return model instanceof ProductDetailsModel;
    }
}