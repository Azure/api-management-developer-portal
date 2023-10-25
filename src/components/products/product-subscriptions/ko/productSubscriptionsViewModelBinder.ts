import { StyleCompiler } from "@paperbits/common/styles";
import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { ProductSubscriptionsModel } from "../productSubscriptionsModel";
import { ProductSubscriptionsViewModel } from "./productSubscriptionsViewModel";


export class ProductSubscriptionsViewModelBinder implements ViewModelBinder<ProductSubscriptionsModel, ProductSubscriptionsViewModel> {
    constructor( private readonly styleCompiler: StyleCompiler) { }

    public stateToInstance(state: WidgetState, componentInstance: ProductSubscriptionsViewModel): void {
        componentInstance.styles(state.styles);
    }

    public async modelToState(model: ProductSubscriptionsModel, state: WidgetState): Promise<void> {
        if (model.styles) {
            state.styles = await this.styleCompiler.getStyleModelAsync(model.styles);
        }
    }
}