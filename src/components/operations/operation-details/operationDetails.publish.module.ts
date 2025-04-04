import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { OperationDetailsModelBinder } from "./operationDetailsModelBinder";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { IWidgetService } from "@paperbits/common/widgets";
import { ComponentFlow } from "@paperbits/common/components";
import { OperationDetailsModel } from "./operationDetailsModel";
import { OperationDetailsViewModel } from "./react/OperationDetailsViewModel";
import { OperationDetailsViewModelBinder } from "./operationDetailsViewModelBinder";

export class OperationDetailsPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("operationDetailsModelBinder", OperationDetailsModelBinder);
        injector.bindSingleton("operationDetailsViewModelBinder", OperationDetailsViewModelBinder);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("operationDetails", {
            modelDefinition: OperationDetailsModel,
            componentBinder: ReactComponentBinder,
            componentDefinition: OperationDetailsViewModel,
            modelBinder: OperationDetailsModelBinder,
            viewModelBinder: OperationDetailsViewModelBinder,
            componentFlow: ComponentFlow.Block
        });
    }
}