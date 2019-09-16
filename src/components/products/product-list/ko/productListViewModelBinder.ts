import { ViewModelBinder } from "@paperbits/common/widgets";
import { ProductListViewModel } from "./productListViewModel";
import { ProductListModel } from "../productListModel";
import { Bag } from "@paperbits/common";

export class ProductListViewModelBinder implements ViewModelBinder<ProductListModel, ProductListViewModel> {
    public async modelToViewModel(model: ProductListModel, viewModel?: ProductListViewModel, bindingContext?: Bag<any>): Promise<ProductListViewModel> {
        if (!viewModel) {
            viewModel = new ProductListViewModel();
        }

        viewModel["widgetBinding"] = {
            displayName: "List of products",
            model: model,
            editor: "product-list-editor",
            applyChanges: async (updatedModel: ProductListModel) => {
                this.modelToViewModel(updatedModel, viewModel, bindingContext);
            }
        };

        return viewModel;
    }

    public canHandleModel(model: ProductListModel): boolean {
        return model instanceof ProductListModel;
    }
}