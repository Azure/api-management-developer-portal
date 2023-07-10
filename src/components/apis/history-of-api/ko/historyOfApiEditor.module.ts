import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { HistoryOfApiHandlers } from "../historyOfApiHandlers";
import { HistoryOfApiEditor } from "./historyOfApiEditor";
import { IWidgetService } from "@paperbits/common/widgets";
import { HistoryOfApiModelBinder } from "../historyOfApiModelBinder";
import { HistoryOfApiViewModelBinder } from "./historyOfApiViewModelBinder";
import { HistoryOfApiModel } from "../historyOfApiModel";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { HistoryOfApiViewModel } from "./historyOfApiViewModel";

export class HistoryOfApiEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("historyOfApiEditor", HistoryOfApiEditor);
        injector.bindSingleton("historyOfApiModelBinder", HistoryOfApiModelBinder);
        injector.bindSingleton("historyOfApiViewModelBinder", HistoryOfApiViewModelBinder)
        injector.bindSingleton("historyOfApiHandlers", HistoryOfApiHandlers);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("historyOfApi", {
            modelDefinition: HistoryOfApiModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: HistoryOfApiViewModel,
            modelBinder: HistoryOfApiModelBinder,
            viewModelBinder: HistoryOfApiViewModelBinder
        });

        widgetService.registerWidgetEditor("historyOfApi", {
            displayName: "API: Change history",
            category: "APIs",
            iconClass: "widget-icon widget-icon-api-management",
            componentBinder: KnockoutComponentBinder,
            componentDefinition: HistoryOfApiEditor,
            handlerComponent: HistoryOfApiHandlers
        });
    }
}