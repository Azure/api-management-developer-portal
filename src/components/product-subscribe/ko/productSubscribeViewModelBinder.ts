import { IViewModelBinder } from "@paperbits/common/widgets";
import { ProductSubscribeViewModel } from "./productSubscribeViewModel";
import { ProductSubscribeModel } from "../productSubscribeModel";

export class ProductSubscribeViewModelBinder implements IViewModelBinder<ProductSubscribeModel, ProductSubscribeViewModel> {
    public modelToViewModel(model: ProductSubscribeModel, readonly: boolean, viewModel?: ProductSubscribeViewModel): ProductSubscribeViewModel {
        if (!viewModel) {
            viewModel = new ProductSubscribeViewModel();
        }

        viewModel["widgetBinding"] = {
            displayName: "Product subscribe",
            readonly: readonly,
            model: model,
            applyChanges: async (updatedModel: ProductSubscribeModel) => {
                Object.assign(model, updatedModel);
                this.modelToViewModel(model, readonly, viewModel);
            }
        }

        return viewModel;
    }

    public canHandleModel(model: ProductSubscribeModel): boolean {
        return model instanceof ProductSubscribeModel;
    }
}