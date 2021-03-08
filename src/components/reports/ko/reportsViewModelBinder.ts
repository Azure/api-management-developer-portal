import { ViewModelBinder } from "@paperbits/common/widgets";
import { ReportsViewModel } from "./reportsViewModel";
import { ReportsModel } from "../reportsModel";
import { Bag } from "@paperbits/common";

export class ReportsViewModelBinder implements ViewModelBinder<ReportsModel, ReportsViewModel> {
    public async modelToViewModel(model: ReportsModel, viewModel?: ReportsViewModel, bindingContext?: Bag<any>): Promise<ReportsViewModel> {
        if (!viewModel) {
            viewModel = new ReportsViewModel();
        }

        viewModel["widgetBinding"] = {
            displayName: "Reports",
            model: model,
            flow: "block",
            draggable: true
        };

        return viewModel;
    }

    public canHandleModel(model: ReportsModel): boolean {
        return model instanceof ReportsModel;
    }
}