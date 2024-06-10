import { StyleCompiler } from "@paperbits/common/styles";
import { ISiteService } from "@paperbits/common/sites";
import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { layoutsMap } from "../../../utils/react/TableListInfo";
import { isRedesignEnabledSetting } from "../../../../constants";
import { ProductApisModel } from "../productApisModel";
import { ProductApisViewModel } from "./productApisViewModel";

export class ProductApisViewModelBinder implements ViewModelBinder<ProductApisModel, ProductApisViewModel> {
    constructor(
        private readonly styleCompiler: StyleCompiler,
        private readonly siteService: ISiteService,
    ) { }

    public stateToInstance(state: WidgetState, componentInstance: ProductApisViewModel): void {
        componentInstance.styles(state.styles);
        componentInstance.layout(state.layout);
        componentInstance.isRedesignEnabled(state.isRedesignEnabled);

        componentInstance.runtimeConfig(JSON.stringify({
            allowSelection: false,
            allowViewSwitching: true,
            filtersInSidebar: true,
            showApiType: false,
            defaultGroupByTagToEnabled: false,
            layoutDefault: layoutsMap[state.layout],
            detailsPageUrl: state.detailsPageHyperlink
                ? state.detailsPageHyperlink.href
                : undefined,
            detailsPageTarget: state.detailsPageHyperlink
                ? state.detailsPageHyperlink.target
                : undefined,
        }));
    }

    public async modelToState(model: ProductApisModel, state: WidgetState): Promise<void> {
        state.detailsPageHyperlink = model.detailsPageHyperlink;
        state.layout = model.layout;

        if (model.styles) {
            state.styles = await this.styleCompiler.getStyleModelAsync(model.styles);
        }

        state.isRedesignEnabled = !!(await this.siteService.getSetting(isRedesignEnabledSetting));
    }
}