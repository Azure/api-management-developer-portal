import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { OperationDetailsModelBinder } from "./operationDetailsModelBinder";
import { OperationDetailsViewModelBinder } from "./ko/operationDetailsViewModelBinder";
import { OperationDetailsModel } from "./operationDetailsModel";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { OperationDetailsViewModel } from "./ko/operationDetailsViewModel";
import { IWidgetService } from "@paperbits/common/widgets";


export class OperationDetailsPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("modelBinders", OperationDetailsModelBinder);
        injector.bindToCollection("viewModelBinders", OperationDetailsViewModelBinder);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("operationDetails", {
            modelDefinition: OperationDetailsModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: OperationDetailsViewModel,
            modelBinder: OperationDetailsModelBinder,
            viewModelBinder: OperationDetailsViewModelBinder
        });
    }
}