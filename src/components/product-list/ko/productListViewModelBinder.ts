import { IViewModelBinder } from "@paperbits/common/widgets";
import { ProductListViewModel } from "./productListViewModel";
import { ProductListModel } from "../productListModel";

export class ProductListViewModelBinder implements IViewModelBinder<ProductListModel, ProductListViewModel> {
    public modelToViewModel(model: ProductListModel, readonly: boolean, viewModel?: ProductListViewModel): ProductListViewModel {
        if (!viewModel) {
            viewModel = new ProductListViewModel();
        }

        viewModel["widgetBinding"] = {
            displayName: "Product list",
            readonly: readonly,
            model: model,
            editor: "product-list-editor",
            applyChanges: async (updatedModel: ProductListModel) => {
                Object.assign(model, updatedModel);
                this.modelToViewModel(model, readonly, viewModel);
            }
        };

        return viewModel;
    }

    public canHandleModel(model: ProductListModel): boolean {
        return model instanceof ProductListModel;
    }
}