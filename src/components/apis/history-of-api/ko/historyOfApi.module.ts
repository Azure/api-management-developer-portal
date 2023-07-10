import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { HistoryOfApiModel } from "../historyOfApiModel";
import { HistoryOfApiModelBinder } from "../historyOfApiModelBinder";
import { HistoryOfApiViewModel } from "./historyOfApiViewModel";
import { HistoryOfApiViewModelBinder } from "./historyOfApiViewModelBinder";


export class HistoryOfApiPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("historyOfApiModelBinder", HistoryOfApiModelBinder);
        injector.bindSingleton("historyOfApiViewModelBinder", HistoryOfApiViewModelBinder)

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("historyOfApi", {
            modelDefinition: HistoryOfApiModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: HistoryOfApiViewModel,
            modelBinder: HistoryOfApiModelBinder,
            viewModelBinder: HistoryOfApiViewModelBinder
        });
    }
}