import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ComponentFlow } from "@paperbits/common/components";
import { HistoryOfApiEditor } from "./ko/historyOfApiEditor";
import { HistoryOfApiModel } from "./historyOfApiModel";
import { HistoryOfApiModelBinder } from "./historyOfApiModelBinder";
import { HistoryOfApiViewModel } from "./react/HistoryOfApiViewModel";
import { HistoryOfApiViewModelBinder } from "./historyOfApiViewModelBinder";
import { HistoryOfApiHandlers } from "./historyOfApiHandlers";

export class HistoryOfApiDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("historyOfApiEditor", HistoryOfApiEditor);
        injector.bindSingleton("historyOfApiModelBinder", HistoryOfApiModelBinder);
        injector.bindSingleton("historyOfApiViewModelBinder", HistoryOfApiViewModelBinder)
        injector.bindSingleton("historyOfApiHandlers", HistoryOfApiHandlers);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("historyOfApi", {
            modelDefinition: HistoryOfApiModel,
            componentBinder: ReactComponentBinder,
            componentDefinition: HistoryOfApiViewModel,
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