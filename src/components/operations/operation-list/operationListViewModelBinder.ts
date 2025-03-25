import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { StyleCompiler } from "@paperbits/common/styles";
import { ISiteService } from "@paperbits/common/sites";
import { Logger } from "@paperbits/common/logging";
import { OperationListViewModel } from "./react/OperationListViewModel";
import { OperationListModel } from "./operationListModel";
import { isRedesignEnabledSetting } from "../../../constants";

export class OperationListViewModelBinder implements ViewModelBinder<OperationListModel, OperationListViewModel> {
    constructor(
        private readonly styleCompiler: StyleCompiler,
        private readonly siteService: ISiteService,
        private readonly logger: Logger
    ) { }

    public stateToInstance(state: WidgetState, componentInstance: OperationListViewModel): void {
        componentInstance.setState(prevState => ({
            styles: state.styles,
            isRedesignEnabled: state.isRedesignEnabled,
            allowSelection: state.allowSelection,
            wrapText: state.wrapText,
            showToggleUrlPath: state.showToggleUrlPath,
            defaultShowUrlPath: state.defaultShowUrlPath,
            defaultGroupByTagToEnabled: state.defaultGroupByTagToEnabled,
            defaultAllGroupTagsExpanded: state.defaultAllGroupTagsExpanded,
            detailsPageUrl: state.detailsPageUrl
        }));
    }

    public async modelToState(model: OperationListModel, state: WidgetState): Promise<void> {
        state.allowSelection = model.allowSelection;
        state.wrapText = model.wrapText;
        state.showToggleUrlPath = model.showToggleUrlPath;
        state.defaultShowUrlPath = model.defaultShowUrlPath;
        state.defaultGroupByTagToEnabled = model.defaultGroupByTagToEnabled;
        state.defaultAllGroupTagsExpanded = model.defaultAllGroupTagsExpanded;
        state.detailsPageUrl = model.detailsPageHyperlink
            ? model.detailsPageHyperlink.href
            : undefined

        if (model.styles) {
            state.styles = await this.styleCompiler.getStyleModelAsync(model.styles);
        }

        let isRedesignEnabled = false;
        
        try {
            isRedesignEnabled = !!(await this.siteService.getSetting(isRedesignEnabledSetting));
        } catch (error) {
            this.logger?.trackError(error, { message: `Failed to get setting: ${isRedesignEnabledSetting} - OperationListViewModelBinder` });
        } finally {
            state.isRedesignEnabled = isRedesignEnabled;
        }
    }
}