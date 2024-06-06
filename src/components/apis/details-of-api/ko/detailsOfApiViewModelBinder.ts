import { StyleCompiler } from "@paperbits/common/styles";
import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { ISiteService } from "@paperbits/common/sites";
import { DetailsOfApiModel } from "../detailsOfApiModel";
import { DetailsOfApiViewModel } from "./detailsOfApiViewModel";
import { isRedesignEnabledSetting } from "../../../../constants";


export class DetailsOfApiViewModelBinder implements ViewModelBinder<DetailsOfApiModel, DetailsOfApiViewModel> {
    constructor(
        private readonly styleCompiler: StyleCompiler,
        private readonly siteService: ISiteService,
    ) { }

    public stateToInstance(state: WidgetState, componentInstance: DetailsOfApiViewModel): void {
        componentInstance.styles(state.styles);
        componentInstance.isRedesignEnabled(state.isRedesignEnabled);

        componentInstance.runtimeConfig(JSON.stringify({
            changeLogPageUrl: state.changeLogPageHyperlink
                ? state.changeLogPageHyperlink.href
                : undefined
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