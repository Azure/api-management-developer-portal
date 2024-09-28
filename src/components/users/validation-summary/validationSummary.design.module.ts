import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ValidationSummaryHandlers } from "./validationSummaryHandlers";
import { IWidgetService } from "@paperbits/common/widgets";
import { ValidationSummaryModelBinder } from "./validationSummaryModelBinder";
import { ValidationSummaryViewModelBinder } from "./ko/validationSummaryViewModelBinder";
import { ValidationSummaryModel } from "./validationSummaryModel";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ValidationSummary } from "./react/ValidationSummary";
import { ValidationSummaryEditor } from "./react/ValidationSummaryEditor";


export class ValidationSummaryDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("validationSummaryModelBinder", ValidationSummaryModelBinder);
        injector.bindSingleton("validationSummaryViewModelBinder", ValidationSummaryViewModelBinder)
        injector.bindSingleton("validationSummaryHandlers", ValidationSummaryHandlers);
        injector.bindSingleton("validationSummaryEditor", ValidationSummaryEditor);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("validationSummary", {
            modelDefinition: ValidationSummaryModel,
            componentBinder: ReactComponentBinder,
            componentDefinition: ValidationSummary,
            modelBinder: ValidationSummaryModelBinder,
            viewModelBinder: ValidationSummaryViewModelBinder
        });

        widgetService.registerWidgetEditor("validationSummary", {
            displayName: "Validation summary",
            category: "User",
            iconClass: "widget-icon widget-icon-api-management",
            handlerComponent: ValidationSummaryHandlers,
            componentBinder: ReactComponentBinder,
            componentDefinition: ValidationSummaryEditor
        });
    }
}