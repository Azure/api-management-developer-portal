import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { OperationListHandlers } from "../operationListHandlers";
import { OperationListEditor } from "./operationListEditor";
import { OperationListModelBinder } from "../operationListModelBinder";
import { OperationListViewModelBinder } from "./operationListViewModelBinder";
import { IWidgetService } from "@paperbits/common/widgets";
import { OperationListModel } from "../operationListModel";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { OperationListViewModel } from "./operationListViewModel";

export class OperationListEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("operationListEditor", OperationListEditor);
        injector.bindSingleton("operationListModelBinder", OperationListModelBinder);
        injector.bindSingleton("operationListViewModelBinder", OperationListViewModelBinder)
        injector.bindSingleton("operationListHandlers", OperationListHandlers);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("operationList", {
            modelDefinition: OperationListModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: OperationListViewModel,
            modelBinder: OperationListModelBinder,
            viewModelBinder: OperationListViewModelBinder
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