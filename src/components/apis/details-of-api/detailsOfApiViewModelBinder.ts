import { StyleCompiler } from "@paperbits/common/styles";
import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { ISiteService } from "@paperbits/common/sites";
import { DetailsOfApiModel } from "./detailsOfApiModel";
import { isRedesignEnabledSetting } from "../../../constants";
import { ApiDetailsViewModel } from "./react/ApiDetailsViewModel";


export class DetailsOfApiViewModelBinder implements ViewModelBinder<DetailsOfApiModel, ApiDetailsViewModel> {
    constructor(
        private readonly styleCompiler: StyleCompiler,
        private readonly siteService: ISiteService,
    ) { }

    public stateToInstance(state: WidgetState, componentInstance: ApiDetailsViewModel): void {
        componentInstance.setState(prevState => ({
            styles: state.styles,
            isRedesignEnabled: state.isRedesignEnabled,
            changeLogPageUrl: state.changeLogPageHyperlink?.href
        }));
    }

    public async modelToState(model: DetailsOfApiModel, state: WidgetState): Promise<void> {
        state.changeLogPageHyperlink = model.changeLogPageHyperlink;

        if (model.styles) {
            state.styles = await this.styleCompiler.getStyleModelAsync(model.styles);
        }

        state.isRedesignEnabled = !!(await this.siteService.getSetting(isRedesignEnabledSetting));
    }
}