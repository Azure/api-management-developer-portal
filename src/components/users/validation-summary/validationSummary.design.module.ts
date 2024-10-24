import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ValidationSummaryHandlers } from "./validationSummaryHandlers";
import { IWidgetService } from "@paperbits/common/widgets";
import { ValidationSummaryModelBinder } from "./validationSummaryModelBinder";
import { ValidationSummaryViewModelBinder } from "./validationSummaryViewModelBinder";
import { ValidationSummaryModel } from "./validationSummaryModel";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ValidationSummaryViewModel } from "./react/ValidationSummaryViewModel";
import { ComponentFlow } from "@paperbits/common/components/componentFlow";

export class ValidationSummaryDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("validationSummaryModelBinder", ValidationSummaryModelBinder);
        injector.bindSingleton("validationSummaryViewModelBinder", ValidationSummaryViewModelBinder)
        injector.bindSingleton("validationSummaryHandlers", ValidationSummaryHandlers);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("validationSummary", {
            modelDefinition: ValidationSummaryModel,
            componentBinder: ReactComponentBinder,
            componentDefinition: ValidationSummaryViewModel,
            modelBinder: ValidationSummaryModelBinder,
            viewModelBinder: ValidationSummaryViewModelBinder,
            componentFlow: ComponentFlow.Block
        });

        widgetService.registerWidgetEditor("validationSummary", {
            displayName: "Validation summary",
            category: "User",
            iconClass: "widget-icon widget-icon-api-management",
            handlerComponent: ValidationSummaryHandlers,
            componentBinder: ReactComponentBinder
        });
    }
}