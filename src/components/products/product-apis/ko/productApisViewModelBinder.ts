import { StyleCompiler } from "@paperbits/common/styles";
import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { ProductApisModel } from "../productApisModel";
import { ProductApisViewModel } from "./productApisViewModel";

export class ProductApisViewModelBinder implements ViewModelBinder<ProductApisModel, ProductApisViewModel> {
    constructor(private readonly styleCompiler: StyleCompiler) { }

    public stateToInstance(state: WidgetState, componentInstance: ProductApisViewModel): void {
        componentInstance.styles(state.styles);
        componentInstance.layout(state.layout);

        componentInstance.runtimeConfig(JSON.stringify({
            detailsPageUrl: state.detailsPageHyperlink
                ? state.detailsPageHyperlink.href
                : undefined,
            detailsPageTarget: state.detailsPageHyperlink
                ? state.detailsPageHyperlink.target
                : undefined,
        }));
    }

    public async modelToState(model: ProductApisModel, state: WidgetState): Promise<void> {
        state.detailsPageHyperlink = model.detailsPageHyperlink;
        state.layout = model.layout;

        if (model.styles) {
            state.styles = await this.styleCompiler.getStyleModelAsync(model.styles);
        }
    }
}