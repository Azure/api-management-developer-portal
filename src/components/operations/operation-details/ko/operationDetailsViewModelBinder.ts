import { ViewModelBinder } from "@paperbits/common/widgets";
import { EventManager } from "@paperbits/common/events";
import { OperationDetailsViewModel } from "./operationDetailsViewModel";
import { OperationDetailsModel } from "../operationDetailsModel";
import { Bag } from "@paperbits/common";


export class OperationDetailsViewModelBinder implements ViewModelBinder<OperationDetailsModel, OperationDetailsViewModel> {
    constructor(private readonly eventManager: EventManager) { }

    public async modelToViewModel(model: OperationDetailsModel, viewModel?: OperationDetailsViewModel, bindingContext?: Bag<any>): Promise<OperationDetailsViewModel> {
        if (!viewModel) {
            viewModel = new OperationDetailsViewModel();

            viewModel["widgetBinding"] = {
                displayName: "Operation: Details",
                model: model,
                draggable: true,
                flow: "block",
                editor: "operation-details-editor",
                applyChanges: async (updatedModel: OperationDetailsModel) => {
                    await this.modelToViewModel(updatedModel, viewModel, bindingContext);
                    this.eventManager.dispatchEvent("onContentUpdate");
                }
            };
        }

        const runtimeConfig = {
            enableConsole: model.enableConsole,
            enableScrollTo: model.enableScrollTo,
            authorizationServers: model.authorizationServers,
            defaultSchemaView: model.defaultSchemaView,
            useCorsProxy: model.useCorsProxy
        };

        viewModel.config(JSON.stringify(runtimeConfig));

        return viewModel;
    }

    public canHandleModel(model: OperationDetailsModel): boolean {
        return model instanceof OperationDetailsModel;
    }
}