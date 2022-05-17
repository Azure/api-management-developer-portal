import { Bag } from "@paperbits/common";
import { ViewModelBinder } from "@paperbits/common/widgets";
import { EventManager, Events } from "@paperbits/common/events";
import { ProductListViewModel } from "./productListViewModel";
import { ProductListModel } from "../productListModel";
import { ComponentFlow } from "@paperbits/common/editing";
import { StyleCompiler } from "@paperbits/common/styles";
import { ProductListDropdownHandlers, ProductListHandlers, ProductListTilesHandlers } from "../productListHandlers";

const handlerForLayout = {
    list: ProductListHandlers,
    dropdown: ProductListDropdownHandlers
};

export class ProductListViewModelBinder implements ViewModelBinder<ProductListModel, ProductListViewModel> {
    constructor(
        private readonly eventManager: EventManager,
        private readonly styleCompiler: StyleCompiler) { }

    public async modelToViewModel(model: ProductListModel, viewModel?: ProductListViewModel, bindingContext?: Bag<any>): Promise<ProductListViewModel> {
        if (!viewModel) {
            viewModel = new ProductListViewModel();
        }

        viewModel.layout(model.layout);

        viewModel.runtimeConfig(JSON.stringify({
            allowSelection: model.allowSelection,
            detailsPageUrl: model.detailsPageHyperlink
                ? model.detailsPageHyperlink.href
                : undefined
        }));

        const handler = handlerForLayout[model.layout] ?? ProductListTilesHandlers;

        viewModel["widgetBinding"] = {
            displayName: "List of products" + (model.layout === "list" ? "" : ` (${model.layout})`),
            layer: bindingContext?.layer,
            model: model,
            draggable: true,
            handler: handler,
            flow: ComponentFlow.Block,
            editor: "product-list-editor",
            applyChanges: async (updatedModel: ProductListModel) => {
                await this.modelToViewModel(updatedModel, viewModel, bindingContext);
                this.eventManager.dispatchEvent(Events.ContentUpdate);
            }
        };

        if (model.styles) {
            viewModel.styles(await this.styleCompiler.getStyleModelAsync(model.styles, bindingContext?.styleManager, handler));
        }

        return viewModel;
    }

    public canHandleModel(model: ProductListModel): boolean {
        return model instanceof ProductListModel;
    }
}