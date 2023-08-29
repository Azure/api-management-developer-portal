import { StyleCompiler } from "@paperbits/common/styles";
import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { ProductDetailsPageModel } from "../productDetailsPageModel";
import { ProductDetailsPageViewModel } from "./productDetailsPageViewModel";

export class ProductDetailsPageViewModelBinder implements ViewModelBinder<ProductDetailsPageModel, ProductDetailsPageViewModel> {
    constructor(
        private readonly styleCompiler: StyleCompiler) { }

    public stateToInstance<TState, TInstance>(state: WidgetState, componentInstance: ProductDetailsPageViewModel): void {
        componentInstance.styles(state.styles);

        componentInstance.runtimeConfig(JSON.stringify({
            wrapText: state.wrapText
        }));
    }

    public async modelToState<TState>(model: ProductDetailsPageModel, state: WidgetState): Promise<void> {
        state.wrapText = model.wrapText;

        if (model.styles) {
            state.styles = await this.styleCompiler.getStyleModelAsync(model.styles);
        }
    }
}