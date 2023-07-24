import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { ReportsModel } from "../reportsModel";
import { ReportsModelBinder } from "../reportsModelBinder";
import { ReportsViewModel } from "./reportsViewModel";
import { ReportsViewModelBinder } from "./reportsViewModelBinder";


export class ReportsPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("reportsModelBinder", ReportsModelBinder);
        injector.bindSingleton("reportsViewModelBinder", ReportsViewModelBinder)

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("reports", {
            modelDefinition: ReportsModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ReportsViewModel,
            modelBinder: ReportsModelBinder,
            viewModelBinder: ReportsViewModelBinder
        });
    }
}