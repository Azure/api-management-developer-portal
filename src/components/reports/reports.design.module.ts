import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { ComponentFlow } from "@paperbits/common/components";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ReportsHandlers } from "./reportsHandlers";
import { ReportsEditor } from "./ko/reportsEditor";
import { ReportsModel } from "./reportsModel";
import { ReportsViewModel } from "./react/ReportsViewModel";
import { ReportsModelBinder } from "./reportsModelBinder";
import { ReportsViewModelBinder } from "./reportsViewModelBinder";

export class ReportsEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("reportsEditor", ReportsEditor);
        injector.bindSingleton("reportsModelBinder", ReportsModelBinder);
        injector.bindSingleton("reportsViewModelBinder", ReportsViewModelBinder)
        injector.bindSingleton("reportsHandlers", ReportsHandlers);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("reports", {
            modelDefinition: ReportsModel,
            componentBinder: ReactComponentBinder,
            componentDefinition: ReportsViewModel,
            modelBinder: ReportsModelBinder,
            viewModelBinder: ReportsViewModelBinder,
            componentFlow: ComponentFlow.Block
        });

        widgetService.registerWidgetEditor("reports", {
            displayName: "Reports",
            category: "Analytics",
            iconClass: "widget-icon widget-icon-api-management",
            handlerComponent: ReportsHandlers
        });
    }
}