import { StyleCompiler } from "@paperbits/common/styles";
import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { ApisListV2Model } from "./apisListV2Model";
import { ApisListV2 } from "./apisListV2";

export class ApisListV2ViewModelBinder implements ViewModelBinder<ApisListV2Model, ApisListV2>  {
    constructor(private readonly styleCompiler: StyleCompiler) { }

    public stateToInstance(nextState: WidgetState, componentInstance: ApisListV2): void {
        componentInstance.setState(prevState => ({
            initialCount: nextState.initialCount,
            classNames: nextState.styles
        }));
    }

    public async modelToState(model: ApisListV2Model, state: WidgetState): Promise<void> {
        if (model.styles) {
            state.styles = await this.styleCompiler.getStyleModelAsync(model.styles);
        }

        state.initialCount = model.initialCount;
    }
}
