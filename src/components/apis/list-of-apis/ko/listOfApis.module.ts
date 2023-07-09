import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ListOfApisModelBinder } from "../listOfApisModelBinder";
import { ListOfApisViewModelBinder } from "./listOfApisViewModelBinder";
import { ListOfApisModel } from "../listOfApisModel";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { ListOfApisViewModel } from "./listOfApisViewModel";
import { IWidgetService } from "@paperbits/common/widgets";


export class ListOfApisPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("modelBinders", ListOfApisModelBinder);
        injector.bindToCollection("viewModelBinders", ListOfApisViewModelBinder);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("listOfApis", {
            modelDefinition: ListOfApisModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ListOfApisViewModel,
            modelBinder: ListOfApisModelBinder,
            viewModelBinder: ListOfApisViewModelBinder
        });

        widgetService.registerWidget("listOfApisTiles", {
            modelDefinition: ListOfApisModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ListOfApisViewModel,
            modelBinder: ListOfApisModelBinder,
            viewModelBinder: ListOfApisViewModelBinder
        });

        widgetService.registerWidget("listOfApisDropdown", {
            modelDefinition: ListOfApisModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ListOfApisViewModel,
            modelBinder: ListOfApisModelBinder,
            viewModelBinder: ListOfApisViewModelBinder
        });
    }
}