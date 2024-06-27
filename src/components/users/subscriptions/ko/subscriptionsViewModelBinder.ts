import { StyleCompiler } from "@paperbits/common/styles";
import { ISiteService } from "@paperbits/common/sites/ISiteService";
import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { isRedesignEnabledSetting } from "../../../../constants";
import { SubscriptionsModel } from "../subscriptionsModel";
import { SubscriptionsViewModel } from "./subscriptionsViewModel";


export class SubscriptionsViewModelBinder implements ViewModelBinder<SubscriptionsModel, SubscriptionsViewModel> {
    constructor(
        private readonly styleCompiler: StyleCompiler,
        private readonly siteService: ISiteService,
    ) { }

    public stateToInstance(state: WidgetState, componentInstance: SubscriptionsViewModel): void {
        componentInstance.styles(state.styles);

        componentInstance.isRedesignEnabled(state.isRedesignEnabled);
    }

    public async modelToState(model: SubscriptionsModel, state: WidgetState): Promise<void> {
        if (model.styles) {
            state.styles = await this.styleCompiler.getStyleModelAsync(model.styles);
        }

        state.isRedesignEnabled = !!(await this.siteService.getSetting(isRedesignEnabledSetting));
    }
}
