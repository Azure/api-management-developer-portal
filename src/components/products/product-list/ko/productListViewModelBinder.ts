import { StyleCompiler } from "@paperbits/common/styles";
import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { ISiteService } from "@paperbits/common/sites";
import { isRedesignEnabledSetting } from "../../../../constants";
import { layoutsMap } from "../../../utils/react/TableListInfo";
import { ProductListDropdownHandlers, ProductListHandlers } from "../productListHandlers";
import { ProductListModel } from "../productListModel";
import { ProductListViewModel } from "./productListViewModel";

const handlerForLayout = {
    list: ProductListHandlers,
    dropdown: ProductListDropdownHandlers
};

export class ProductListViewModelBinder implements ViewModelBinder<ProductListModel, ProductListViewModel> {
    constructor(
        private readonly styleCompiler: StyleCompiler,
        private readonly siteService: ISiteService,
    ) { }

    public stateToInstance(state: WidgetState, componentInstance: ProductListViewModel): void {
        componentInstance.styles(state.styles);
        componentInstance.layout(state.layout);
        componentInstance.isRedesignEnabled(state.isRedesignEnabled);

        componentInstance.runtimeConfig(JSON.stringify({
            allowSelection: state.allowSelection,
            allowViewSwitching: state.allowViewSwitching,
            layoutDefault: layoutsMap[state.layout],
            detailsPageUrl: state.detailsPageHyperlink
                ? state.detailsPageHyperlink.href
                : undefined
        }));
    }

    public async modelToState(model: ProductListModel, state: WidgetState): Promise<void> {
        state.allowSelection = model.allowSelection;
        state.allowViewSwitching = model.allowViewSwitching;
        state.detailsPageHyperlink = model.detailsPageHyperlink;
        state.layout = model.layout;

        if (model.styles) {
            state.styles = await this.styleCompiler.getStyleModelAsync(model.styles);
        }

        state.isRedesignEnabled = !!(await this.siteService.getSetting(isRedesignEnabledSetting));
    }
}