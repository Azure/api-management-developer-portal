import { StyleCompiler } from "@paperbits/common/styles";
import { ISiteService } from "@paperbits/common/sites";
import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { Logger } from "@paperbits/common/logging";
import { FiltersPosition } from "../../apis/list-of-apis/listOfApisContract";
import { layoutsMap } from "../../utils/react/TableListInfo";
import { ProductApisModel } from "./productApisModel";
import { ProductApisViewModel } from "./react/ProductApisViewModel";
import { isRedesignEnabledSetting } from "../../../constants";

export class ProductApisViewModelBinder implements ViewModelBinder<ProductApisModel, ProductApisViewModel> {
    constructor(
        private readonly styleCompiler: StyleCompiler,
        private readonly siteService: ISiteService,
        private readonly logger: Logger
    ) { }

    public stateToInstance(state: WidgetState, componentInstance: ProductApisViewModel): void {
        componentInstance.setState(prevState => ({
            isRedesignEnabled: state.isRedesignEnabled,
            styles: state.styles,
            layout: state.layout,
            layoutDefault: layoutsMap[state.layout],
            allowSelection: false,
            allowViewSwitching: true,
            filtersPosition: FiltersPosition.none,
            showApiType: false,
            defaultGroupByTagToEnabled: false,
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

        let isRedesignEnabled = false;
        
        try {
            isRedesignEnabled = !!(await this.siteService.getSetting(isRedesignEnabledSetting));
        } catch (error) {
            this.logger?.trackError(error, { message: `Failed to get setting: ${isRedesignEnabledSetting} - ProductApisViewModelBinder` });
        } finally {
            state.isRedesignEnabled = isRedesignEnabled;
        }
    }
}