import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { StyleCompiler } from "@paperbits/common/styles";
import { ISiteService } from "@paperbits/common/sites";
import { layoutsMap } from "../../../utils/react/TableListInfo";
import { isRedesignEnabledSetting } from "../../../../constants";
import { ListOfApisModel } from "../listOfApisModel";
import { ListOfApisViewModel } from "./listOfApisViewModel";

export class ListOfApisViewModelBinder implements ViewModelBinder<ListOfApisModel, ListOfApisViewModel> {
    constructor(
        private readonly styleCompiler: StyleCompiler,
        private readonly siteService: ISiteService,
    ) { }

    public stateToInstance(state: WidgetState, componentInstance: ListOfApisViewModel): void {
        componentInstance.styles(state.styles);
        componentInstance.layout(state.layout);
        componentInstance.isRedesignEnabled(state.isRedesignEnabled);

        componentInstance.runtimeConfig(JSON.stringify({
            allowSelection: state.allowSelection,
            allowViewSwitching: state.allowViewSwitching,
            filtersPosition: state.filtersPosition,
            showApiType: state.showApiType,
            defaultGroupByTagToEnabled: state.defaultGroupByTagToEnabled,
            layoutDefault: layoutsMap[state.layout],
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

        state.isRedesignEnabled = !!(await this.siteService.getSetting(isRedesignEnabledSetting));
    }
}