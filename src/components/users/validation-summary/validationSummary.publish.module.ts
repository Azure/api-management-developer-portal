import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { ValidationSummaryViewModel } from "./react/ValidationSummaryViewModel";
import { ValidationSummaryViewModelBinder } from "./validationSummaryViewModelBinder";
import { ValidationSummaryModel } from "./validationSummaryModel";
import { ValidationSummaryModelBinder } from "./validationSummaryModelBinder";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ComponentFlow } from "@paperbits/common/components";


export class ValidationSummaryPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("validationSummaryModelBinder", ValidationSummaryModelBinder);
        injector.bindSingleton("validationSummaryViewModelBinder", ValidationSummaryViewModelBinder)

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("validationSummary", {
            modelDefinition: ValidationSummaryModel,
            componentBinder: ReactComponentBinder,
            componentDefinition: ValidationSummaryViewModel,
            modelBinder: ValidationSummaryModelBinder,
            viewModelBinder: ValidationSummaryViewModelBinder,
            componentFlow: ComponentFlow.Block
        });
    }
}