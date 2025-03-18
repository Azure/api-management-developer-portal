import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ApplicationListModelBinder } from "./applicationListModelBinder";
import { ApplicationListViewModelBinder } from "./applicationListViewModelBinder";
import { ApplicationListModel } from "./applicationListModel";
import { ApplicationListViewModel } from "./react/ApplicationListViewModel";
import { IWidgetService } from "@paperbits/common/widgets";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ComponentFlow } from "@paperbits/common/components";


export class ApplicationListPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("modelBinders", ApplicationListModelBinder);
        injector.bindToCollection("viewModelBinders", ApplicationListViewModelBinder);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("operationList", {
            modelDefinition: ApplicationListModel,
            componentBinder: ReactComponentBinder,
            componentDefinition: ApplicationListViewModel,
            modelBinder: ApplicationListModelBinder,
            viewModelBinder: ApplicationListViewModelBinder,
            componentFlow: ComponentFlow.Block
        });
    }
}