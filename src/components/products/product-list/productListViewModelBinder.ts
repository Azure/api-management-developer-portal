import { StyleCompiler } from "@paperbits/common/styles";
import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { ISiteService } from "@paperbits/common/sites";
import { layoutsMap } from "../../utils/react/TableListInfo";
import { ProductListModel } from "./productListModel";
import { ProductListViewModel } from "./react/ProductListViewModel";
import { isRedesignEnabledSetting } from "../../../constants";

export class ProductListViewModelBinder implements ViewModelBinder<ProductListModel, ProductListViewModel> {
    constructor(
        private readonly styleCompiler: StyleCompiler,
        private readonly siteService: ISiteService,
    ) { }

    public stateToInstance(state: WidgetState, componentInstance: ProductListViewModel): void {
        componentInstance.setState(prevState => ({
            isRedesignEnabled: state.isRedesignEnabled,
            styles: state.styles,
            layout: state.layout,
            layoutDefault: layoutsMap[state.layout],
            allowSelection: state.allowSelection,
            allowViewSwitching: state.allowViewSwitching,
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