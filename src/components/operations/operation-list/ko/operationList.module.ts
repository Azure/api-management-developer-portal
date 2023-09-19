import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { OperationListModelBinder } from "../operationListModelBinder";
import { OperationListViewModelBinder } from "./operationListViewModelBinder";
import { OperationListModel } from "../operationListModel";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { OperationListViewModel } from "./operationListViewModel";
import { IWidgetService } from "@paperbits/common/widgets";


export class OperationListPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("modelBinders", OperationListModelBinder);
        injector.bindToCollection("viewModelBinders", OperationListViewModelBinder);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("operationList", {
            modelDefinition: OperationListModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: OperationListViewModel,
            modelBinder: OperationListModelBinder,
            viewModelBinder: OperationListViewModelBinder
        });
    }
}