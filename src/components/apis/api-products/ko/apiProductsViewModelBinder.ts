import { Bag } from "@paperbits/common";
import { EventManager } from "@paperbits/common/events";
import { ViewModelBinder } from "@paperbits/common/widgets";
import { ApiProductsViewModel } from "./apiProductsViewModel";
import { ApiProductsModel } from "../apiProductsModel";

export class ApiProductsViewModelBinder implements ViewModelBinder<ApiProductsModel, ApiProductsViewModel> {
    constructor(private readonly eventManager: EventManager) { }
    
    public async modelToViewModel(model: ApiProductsModel, viewModel?: ApiProductsViewModel, bindingContext?: Bag<any>): Promise<ApiProductsViewModel> {
        if (!viewModel) {
            viewModel = new ApiProductsViewModel();
        }

        viewModel.layout(model.layout);

        viewModel.runtimeConfig(JSON.stringify({
            detailsPageUrl: model.detailsPageHyperlink
                ? model.detailsPageHyperlink.href
                : undefined
        }));

        viewModel["widgetBinding"] = {
            displayName: "API: Products" + (model.layout === "list" ? "" : ` (${model.layout})`),
            model: model,
            draggable: true,
            flow: "block",
            editor: "api-products-editor",
            applyChanges: async (updatedModel: ApiProductsModel) => {
                await this.modelToViewModel(updatedModel, viewModel, bindingContext);
                this.eventManager.dispatchEvent("onContentUpdate");
            }
        };

        return viewModel;
    }

    public canHandleModel(model: ApiProductsModel): boolean {
        return model instanceof ApiProductsModel;
    }
}