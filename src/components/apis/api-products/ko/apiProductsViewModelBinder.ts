import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { ApiProductsModel } from "../apiProductsModel";
import { ApiProductsViewModel } from "./apiProductsViewModel";

export class ApiProductsViewModelBinder implements ViewModelBinder<ApiProductsModel, ApiProductsViewModel> {
    public stateToInstance(state: WidgetState, componentInstance: ApiProductsViewModel): void {
        componentInstance.layout(state.layout);
        componentInstance.runtimeConfig(JSON.stringify({
            detailsPageUrl: state.detailsPageUrl
        }));
    }

    public async modelToState(model: ApiProductsModel, state: WidgetState): Promise<void> {
        state.layout = model.layout;
        state.detailsPageUrl = model.detailsPageHyperlink
            ? model.detailsPageHyperlink.href
            : undefined
    }
}