import { StyleCompiler } from "@paperbits/common/styles";
import { ISiteService } from "@paperbits/common/sites";
import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { ProductSubscriptionsModel } from "./productSubscriptionsModel";
import { ProductSubscriptionsViewModel } from "./react/ProductSubscriptionsViewModel";
import { isRedesignEnabledSetting } from "../../../constants";

export class ProductSubscriptionsViewModelBinder implements ViewModelBinder<ProductSubscriptionsModel, ProductSubscriptionsViewModel> {
    constructor(
        private readonly styleCompiler: StyleCompiler,
        private readonly siteService: ISiteService,
    ) { }

    public stateToInstance(state: WidgetState, componentInstance: ProductSubscriptionsViewModel): void {
        componentInstance.setState(prevState => ({
            styles: state.styles,
            isRedesignEnabled: state.isRedesignEnabled
        }));
    }

    public async modelToState(model: ProductSubscriptionsModel, state: WidgetState): Promise<void> {
        if (model.styles) {
            state.styles = await this.styleCompiler.getStyleModelAsync(model.styles);
        }
        
        state.isRedesignEnabled = !!(await this.siteService.getSetting(isRedesignEnabledSetting));
    }
}