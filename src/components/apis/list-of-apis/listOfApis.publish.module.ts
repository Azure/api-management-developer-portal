import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ComponentFlow } from "@paperbits/common/components";
import { ListOfApisModel } from "./listOfApisModel";
import { ListOfApisModelBinder } from "./listOfApisModelBinder";
import { ListOfApisViewModel } from "./react/ListOfApisViewModel";
import { ListOfApisViewModelBinder } from "./listOfApisViewModelBinder";

export class ListOfApisPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("modelBinders", ListOfApisModelBinder);
        injector.bindToCollection("viewModelBinders", ListOfApisViewModelBinder);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        const apiListWidget = {
            modelDefinition: ListOfApisModel,
            componentBinder: ReactComponentBinder,
            componentDefinition: ListOfApisViewModel,
            modelBinder: ListOfApisModelBinder,
            viewModelBinder: ListOfApisViewModelBinder,
            componentFlow: ComponentFlow.Block
        };

        widgetService.registerWidget("listOfApis", apiListWidget);
        widgetService.registerWidget("listOfApisTiles", apiListWidget);
        widgetService.registerWidget("listOfApisDropdown", apiListWidget);
    }
}