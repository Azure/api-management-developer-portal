import { StyleCompiler } from "@paperbits/common/styles";
import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { ProductListDropdownHandlers, ProductListHandlers } from "../productListHandlers";
import { ProductListModel } from "../productListModel";
import { ProductListViewModel } from "./productListViewModel";

const handlerForLayout = {
    list: ProductListHandlers,
    dropdown: ProductListDropdownHandlers
};

export class ProductListViewModelBinder implements ViewModelBinder<ProductListModel, ProductListViewModel> {
    constructor(private readonly styleCompiler: StyleCompiler) { }

    public stateToInstance(state: WidgetState, componentInstance: ProductListViewModel): void {
        componentInstance.styles(state.styles);
        componentInstance.layout(state.layout);
        
        componentInstance.runtimeConfig(JSON.stringify({
            allowSelection: state.allowSelection,
            detailsPageUrl: state.detailsPageHyperlink
                ? state.detailsPageHyperlink.href
                : undefined
        }));
    }

    public async modelToState(model: ProductListModel, state: WidgetState): Promise<void> {
        state.allowSelection = model.allowSelection;
        state.detailsPageHyperlink = model.detailsPageHyperlink;
        state.layout=model.layout;

        if (model.styles) {
            state.styles = await this.styleCompiler.getStyleModelAsync(model.styles);
        }
    }
}