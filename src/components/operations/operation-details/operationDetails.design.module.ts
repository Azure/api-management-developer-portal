import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ComponentFlow } from "@paperbits/common/components";
import { OperationDetailsEditor } from "./ko/operationDetailsEditor";
import { OperationDetailsHandlers } from "./operationDetailsHandlers";
import { OperationDetailsModel } from "./operationDetailsModel";
import { OperationDetailsModelBinder } from "./operationDetailsModelBinder";
import { OperationDetailsViewModel } from "./react/OperationDetailsViewModel";
import { OperationDetailsViewModelBinder } from "./operationDetailsViewModelBinder";

export class OperationDetailsDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("operationDetailsEditor", OperationDetailsEditor);
        injector.bindSingleton("operationDetailsModelBinder", OperationDetailsModelBinder);
        injector.bindSingleton("operationDetailsViewModelBinder", OperationDetailsViewModelBinder)
        injector.bindSingleton("operationDetailsHandlers", OperationDetailsHandlers);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("operationDetails", {
            modelDefinition: OperationDetailsModel,
            componentBinder: ReactComponentBinder,
            componentDefinition: OperationDetailsViewModel,
            modelBinder: OperationDetailsModelBinder,
            viewModelBinder: OperationDetailsViewModelBinder,
            componentFlow: ComponentFlow.Block
        });

        widgetService.registerWidgetEditor("operationDetails", {
            displayName: "Operation: Details",
            category: "APIs",
            iconClass: "widget-icon widget-icon-api-management",
            componentBinder: KnockoutComponentBinder,
            componentDefinition: OperationDetailsEditor,
            handlerComponent: OperationDetailsHandlers
        });
    }
}