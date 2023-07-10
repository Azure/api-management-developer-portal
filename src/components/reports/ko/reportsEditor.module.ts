import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ReportsHandlers } from "../reportsHandlers";
import { ReportsEditor } from "./reportsEditor";
import { ReportsModelBinder } from "../reportsModelBinder";
import { ReportsViewModelBinder } from "./reportsViewModelBinder";
import { IWidgetService } from "@paperbits/common/widgets";
import { ReportsModel } from "../reportsModel";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { ReportsViewModel } from "./reportsViewModel";

export class ReportsEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("reportsEditor", ReportsEditor);
        injector.bindSingleton("reportsModelBinder", ReportsModelBinder);
        injector.bindSingleton("reportsViewModelBinder", ReportsViewModelBinder)
        injector.bindSingleton("reportsHandlers", ReportsHandlers);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("reports", {
            modelDefinition: ReportsModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ReportsViewModel,
            modelBinder: ReportsModelBinder,
            viewModelBinder: ReportsViewModelBinder
        });

        widgetService.registerWidgetEditor("reports", {
            displayName: "Reports",
            category: "Analytics",
            iconClass: "widget-icon widget-icon-api-management",
            handlerComponent: ReportsHandlers
        });
    }
}