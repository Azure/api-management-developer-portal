import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { OperationListHandlers } from "./operationListHandlers";
import { OperationListEditor } from "./ko/operationListEditor";
import { OperationListModelBinder } from "./operationListModelBinder";
import { OperationListViewModelBinder } from "./operationListViewModelBinder";
import { IWidgetService } from "@paperbits/common/widgets";
import { OperationListModel } from "./operationListModel";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { OperationListViewModel } from "./react/OperationListViewModel";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ComponentFlow } from "@paperbits/common/components";

export class OperationListDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("operationListEditor", OperationListEditor);
        injector.bindSingleton("operationListModelBinder", OperationListModelBinder);
        injector.bindSingleton("operationListViewModelBinder", OperationListViewModelBinder)
        injector.bindSingleton("operationListHandlers", OperationListHandlers);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("operationList", {
            modelDefinition: OperationListModel,
            componentBinder: ReactComponentBinder,
            componentDefinition: OperationListViewModel,
            modelBinder: OperationListModelBinder,
            viewModelBinder: OperationListViewModelBinder,
            componentFlow: ComponentFlow.Block
        });

        widgetService.registerWidgetEditor("operationList", {
            displayName: "List of operations",
            category: "Operations",
            iconClass: "widget-icon widget-icon-api-management",
            componentBinder: KnockoutComponentBinder,
            componentDefinition: OperationListEditor,
            handlerComponent: OperationListHandlers
        });
    }
}