import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { ValidationSummaryViewModel } from "./ko/validationSummaryViewModel";
import { ValidationSummaryViewModelBinder } from "./ko/validationSummaryViewModelBinder";
import { ValidationSummaryModel } from "./validationSummaryModel";
import { ValidationSummaryModelBinder } from "./validationSummaryModelBinder";


export class ValidationSummaryPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("validationSummaryModelBinder", ValidationSummaryModelBinder);
        injector.bindSingleton("validationSummaryViewModelBinder", ValidationSummaryViewModelBinder)

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("validationSummary", {
            modelDefinition: ValidationSummaryModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ValidationSummaryViewModel,
            modelBinder: ValidationSummaryModelBinder,
            viewModelBinder: ValidationSummaryViewModelBinder
        });
    }
}