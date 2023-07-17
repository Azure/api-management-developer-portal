import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ValidationSummaryHandlers } from "./validationSummaryHandlers";
import { IWidgetService } from "@paperbits/common/widgets";
import { ValidationSummaryModelBinder } from "./validationSummaryModelBinder";
import { ValidationSummaryViewModelBinder } from "./ko/validationSummaryViewModelBinder";
import { ValidationSummaryModel } from "./validationSummaryModel";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { ValidationSummaryViewModel } from "./ko/validationSummaryViewModel";


export class ValidationSummaryDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("validationSummaryModelBinder", ValidationSummaryModelBinder);
        injector.bindSingleton("validationSummaryViewModelBinder", ValidationSummaryViewModelBinder)
        injector.bindSingleton("validationSummaryHandlers", ValidationSummaryHandlers);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("validationSummary", {
            modelDefinition: ValidationSummaryModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ValidationSummaryViewModel,
            modelBinder: ValidationSummaryModelBinder,
            viewModelBinder: ValidationSummaryViewModelBinder
        });

        widgetService.registerWidgetEditor("validationSummary", {
            displayName: "Validation summary",
            category: "User",
            iconClass: "widget-icon widget-icon-api-management",
            handlerComponent: ValidationSummaryHandlers
        });
    }
}