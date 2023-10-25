import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { OperationDetailsModelBinder } from "../operationDetailsModelBinder";
import { OperationDetailsViewModelBinder } from "./operationDetailsViewModelBinder";
import { IWidgetService } from "@paperbits/common/widgets";
import { OperationDetailsModel } from "../operationDetailsModel";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { OperationDetailsViewModel } from "./operationDetailsViewModel";


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