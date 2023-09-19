import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { OperationDetailsEditor } from "./ko/operationDetailsEditor";
import { OperationDetailsViewModel } from "./ko/operationDetailsViewModel";
import { OperationDetailsViewModelBinder } from "./ko/operationDetailsViewModelBinder";
import { OperationDetailsHandlers } from "./operationDetailsHandlers";
import { OperationDetailsModel } from "./operationDetailsModel";
import { OperationDetailsModelBinder } from "./operationDetailsModelBinder";


export class OperationDetailsDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("operationDetailsEditor", OperationDetailsEditor);
        injector.bindSingleton("operationDetailsModelBinder", OperationDetailsModelBinder);
        injector.bindSingleton("operationDetailsViewModelBinder", OperationDetailsViewModelBinder)
        injector.bindSingleton("operationDetailsHandlers", OperationDetailsHandlers);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("operationDetails", {
            modelDefinition: OperationDetailsModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: OperationDetailsViewModel,
            modelBinder: OperationDetailsModelBinder,
            viewModelBinder: OperationDetailsViewModelBinder
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