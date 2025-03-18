import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ComponentFlow } from "@paperbits/common/components";
import { ApplicationListHandlers } from "./applicationListHandlers";
import { ApplicationListModel } from "./applicationListModel";
import { ApplicationListModelBinder } from "./applicationListModelBinder";
import { ApplicationListViewModel } from "./react/ApplicationListViewModel";
import { ApplicationListViewModelBinder } from "./applicationListViewModelBinder";

export class ApplicationListDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        //injector.bind("operationListEditor", OperationListEditor);
        injector.bindSingleton("applicationListModelBinder", ApplicationListModelBinder);
        injector.bindSingleton("applicationListViewModelBinder", ApplicationListViewModelBinder)
        injector.bindSingleton("applicationListHandlers", ApplicationListHandlers);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("operationList", {
            modelDefinition: ApplicationListModel,
            componentBinder: ReactComponentBinder,
            componentDefinition: ApplicationListViewModel,
            modelBinder: ApplicationListModelBinder,
            viewModelBinder: ApplicationListViewModelBinder,
            componentFlow: ComponentFlow.Block
        });

        widgetService.registerWidgetEditor("product-details", {
            displayName: "Application: List",
            category: "Applications",
            iconClass: "widget-icon widget-icon-api-management",
            componentBinder: KnockoutComponentBinder,
            handlerComponent: ApplicationListHandlers
        });
    }
}