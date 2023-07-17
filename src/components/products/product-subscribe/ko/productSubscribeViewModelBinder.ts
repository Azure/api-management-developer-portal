import { StyleCompiler } from "@paperbits/common/styles";
import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { ProductSubscribeModel } from "../productSubscribeModel";
import { ProductSubscribeViewModel } from "./productSubscribeViewModel";


export class ProductSubscribeViewModelBinder implements ViewModelBinder<ProductSubscribeModel, ProductSubscribeViewModel> {
    constructor(private readonly styleCompiler: StyleCompiler) { }

    public stateToInstance(state: WidgetState, componentInstance: ProductSubscribeViewModel): void {
        componentInstance.styles(state.styles);

        componentInstance.runtimeConfig(JSON.stringify({
            showTermsByDefault: state.showTermsByDefault
        }));
    }

    public async modelToState(model: ProductSubscribeModel, state: WidgetState): Promise<void> {
        state.showTermsByDefault = model.showTermsByDefault;

        if (model.styles) {
            state.styles = await this.styleCompiler.getStyleModelAsync(model.styles);
        }
    }
}