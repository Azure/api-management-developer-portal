import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { StyleCompiler } from "@paperbits/common/styles";
import { ISiteService } from "@paperbits/common/sites";
import { Logger } from "@paperbits/common/logging";
import { layoutsMap } from "../../utils/react/TableListInfo";
import { ListOfApisModel } from "./listOfApisModel";
import { ListOfApisViewModel } from "./react/ListOfApisViewModel";
import { isRedesignEnabledSetting } from "../../../constants";

export class ListOfApisViewModelBinder implements ViewModelBinder<ListOfApisModel, ListOfApisViewModel> {
    constructor(
        private readonly styleCompiler: StyleCompiler,
        private readonly siteService: ISiteService,
        private readonly logger: Logger
    ) { }

    public stateToInstance(state: WidgetState, componentInstance: ListOfApisViewModel): void {
        componentInstance.setState(prevState => ({
            isRedesignEnabled: state.isRedesignEnabled,
            styles: state.styles,
            layout: state.layout,
            layoutDefault: layoutsMap[state.layout],
            allowSelection: state.allowSelection,
            allowViewSwitching: state.allowViewSwitching,
            filtersPosition: state.filtersPosition,
            showApiType: state.showApiType,
            defaultGroupByTagToEnabled: state.defaultGroupByTagToEnabled,
            detailsPageUrl: state.detailsPageHyperlink
                ? state.detailsPageHyperlink.href
                : undefined,
            detailsPageTarget: state.detailsPageHyperlink
                ? state.detailsPageHyperlink.target
                : undefined,
        }));
    }

    public async modelToState(model: ListOfApisModel, state: WidgetState): Promise<void> {
        state.layout = model.layout;

        state.allowSelection = model.allowSelection;
        state.allowViewSwitching = model.allowViewSwitching;
        state.filtersPosition = model.filtersPosition;
        state.showApiType = model.showApiType;
        state.defaultGroupByTagToEnabled = model.defaultGroupByTagToEnabled;
        state.detailsPageHyperlink = model.detailsPageHyperlink;

        if (model.styles) {
            state.styles = await this.styleCompiler.getStyleModelAsync(model.styles);
        }

        let isRedesignEnabled = false;
        
        try {
            isRedesignEnabled = !!(await this.siteService.getSetting(isRedesignEnabledSetting));
        } catch (error) {
            this.logger?.trackError(error, { message: `Failed to get setting: ${isRedesignEnabledSetting} - ListOfApisViewModelBinder` });
        } finally {
            state.isRedesignEnabled = isRedesignEnabled;
        }
    }
}