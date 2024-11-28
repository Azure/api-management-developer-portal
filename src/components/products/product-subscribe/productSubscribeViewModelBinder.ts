import { ISiteService } from "@paperbits/common/sites";
import { StyleCompiler } from "@paperbits/common/styles";
import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { ProductSubscribeModel } from "./productSubscribeModel";
import { ProductSubscribeViewModel } from "./react/ProductSubscribeViewModel";
import { isRedesignEnabledSetting } from "../../../constants";

export class ProductSubscribeViewModelBinder implements ViewModelBinder<ProductSubscribeModel, ProductSubscribeViewModel> {
    constructor(
        private readonly styleCompiler: StyleCompiler,
        private readonly siteService: ISiteService,
    ) { }

    public stateToInstance(state: WidgetState, componentInstance: ProductSubscribeViewModel): void {
        componentInstance.setState(prevState => ({
            styles: state.styles,
            isRedesignEnabled: state.isRedesignEnabled,
            showTermsByDefault: state.showTermsByDefault
        }));
    }

    public async modelToState(model: ProductSubscribeModel, state: WidgetState): Promise<void> {
        state.showTermsByDefault = model.showTermsByDefault;

        if (model.styles) {
            state.styles = await this.styleCompiler.getStyleModelAsync(model.styles);
        }

        state.isRedesignEnabled = !!(await this.siteService.getSetting(isRedesignEnabledSetting));
    }
}