import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { StyleCompiler } from "@paperbits/common/styles";
import { ISiteService } from "@paperbits/common/sites";
import { Logger } from "@paperbits/common/logging";
import { ApplicationListViewModel } from "./react/ApplicationListViewModel";
import { ApplicationListModel } from "./applicationListModel";
import { isRedesignEnabledSetting } from "../../../constants";

export class ApplicationListViewModelBinder implements ViewModelBinder<ApplicationListModel, ApplicationListViewModel> {
    constructor(
        private readonly styleCompiler: StyleCompiler,
        private readonly siteService: ISiteService,
        private readonly logger: Logger
    ) { }

    public stateToInstance(state: WidgetState, componentInstance: ApplicationListViewModel): void {
        componentInstance.setState(prevState => ({
            styles: state.styles,
            isRedesignEnabled: state.isRedesignEnabled
        }));
    }

    public async modelToState(model: ApplicationListModel, state: WidgetState): Promise<void> {
        if (model.styles) {
            state.styles = await this.styleCompiler.getStyleModelAsync(model.styles);
        }

        let isRedesignEnabled = false;
        
        try {
            isRedesignEnabled = !!(await this.siteService.getSetting(isRedesignEnabledSetting));
        } catch (error) {
            this.logger?.trackError(error, { message: `Failed to get setting: ${isRedesignEnabledSetting} - ApplicationListViewModelBinder` });
        } finally {
            state.isRedesignEnabled = isRedesignEnabled;
        }
    }
}