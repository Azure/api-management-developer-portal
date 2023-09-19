import { StyleCompiler } from "@paperbits/common/styles";
import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { SubscriptionsModel } from "../subscriptionsModel";
import { SubscriptionsViewModel } from "./subscriptionsViewModel";


export class SubscriptionsViewModelBinder implements ViewModelBinder<SubscriptionsModel, SubscriptionsViewModel> {
    constructor(private readonly styleCompiler: StyleCompiler) { }

    public stateToInstance(state: WidgetState, componentInstance: SubscriptionsViewModel): void {
        componentInstance.styles(state.styles);
    }

    public async modelToState(model: SubscriptionsModel, state: WidgetState): Promise<void> {
        if (model.styles) {
            state.styles = await this.styleCompiler.getStyleModelAsync(model.styles);
        }
    }
}