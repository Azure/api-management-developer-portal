import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { OperationListModelBinder } from "./operationListModelBinder";
import { OperationListViewModelBinder } from "./operationListViewModelBinder";
import { OperationListModel } from "./operationListModel";
import { OperationListViewModel } from "./react/OperationListViewModel";
import { IWidgetService } from "@paperbits/common/widgets";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ComponentFlow } from "@paperbits/common/components";


export class OperationListPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("modelBinders", OperationListModelBinder);
        injector.bindToCollection("viewModelBinders", OperationListViewModelBinder);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("operationList", {
            modelDefinition: OperationListModel,
            componentBinder: ReactComponentBinder,
            componentDefinition: OperationListViewModel,
            modelBinder: OperationListModelBinder,
            viewModelBinder: OperationListViewModelBinder,
            componentFlow: ComponentFlow.Block
        });
    }
}