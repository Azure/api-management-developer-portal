import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { HistoryOfApiHandlers } from "./historyOfApiHandlers";
import { HistoryOfApiEditor } from "./ko/historyOfApiEditor";
import { IWidgetService } from "@paperbits/common/widgets";
import { HistoryOfApiModelBinder } from "./historyOfApiModelBinder";
import { HistoryOfApiViewModelBinder } from "./historyOfApiViewModelBinder";
import { HistoryOfApiModel } from "./historyOfApiModel";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ApiHistoryViewModel } from "./react/ApiHistoryViewModel";
import { ComponentFlow } from "@paperbits/common/components";

export class HistoryOfApiEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("historyOfApiEditor", HistoryOfApiEditor);
        injector.bindSingleton("historyOfApiModelBinder", HistoryOfApiModelBinder);
        injector.bindSingleton("historyOfApiViewModelBinder", HistoryOfApiViewModelBinder)
        injector.bindSingleton("historyOfApiHandlers", HistoryOfApiHandlers);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("historyOfApi", {
            modelDefinition: HistoryOfApiModel,
            componentBinder: ReactComponentBinder,
            componentDefinition: ApiHistoryViewModel,
            modelBinder: HistoryOfApiModelBinder,
            viewModelBinder: HistoryOfApiViewModelBinder,
            componentFlow: ComponentFlow.Block
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