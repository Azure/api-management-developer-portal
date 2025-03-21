import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { ComponentFlow } from "@paperbits/common/components";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ReportsModel } from "./reportsModel";
import { ReportsModelBinder } from "./reportsModelBinder";
import { ReportsViewModel } from "./react/ReportsViewModel";
import { ReportsViewModelBinder } from "./reportsViewModelBinder";


export class ReportsPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("reportsModelBinder", ReportsModelBinder);
        injector.bindSingleton("reportsViewModelBinder", ReportsViewModelBinder)

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("reports", {
            modelDefinition: ReportsModel,
            componentBinder: ReactComponentBinder,
            componentDefinition: ReportsViewModel,
            modelBinder: ReportsModelBinder,
            viewModelBinder: ReportsViewModelBinder,
            componentFlow: ComponentFlow.Block
        });
    }
}