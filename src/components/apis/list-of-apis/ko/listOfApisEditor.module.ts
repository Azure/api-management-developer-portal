import { ListOfApisEditor } from "./listOfApisEditor";
import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ListOfApisDropdownHandlers, ListOfApisHandlers, ListOfApisTilesHandlers } from "../listOfApisHandlers";
import { ListOfApisModelBinder } from "../listOfApisModelBinder";
import { ListOfApisViewModelBinder } from "./listOfApisViewModelBinder";
import { IWidgetService } from "@paperbits/common/widgets";
import { ListOfApisModel } from "../listOfApisModel";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { ListOfApisViewModel } from "./listOfApisViewModel";


export class ListOfApisDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("listOfApisEditor", ListOfApisEditor);
        injector.bindSingleton("listOfApisModelBinder", ListOfApisModelBinder);
        injector.bindSingleton("listOfApisViewModelBinder", ListOfApisViewModelBinder)
        injector.bindSingleton("listOfApisHandlers", ListOfApisHandlers);
        injector.bindSingleton("listOfApisDropdownHandlers", ListOfApisDropdownHandlers)
        injector.bindSingleton("listOfApisTilesHandlers", ListOfApisTilesHandlers)

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("listOfApis", {
            modelDefinition: ListOfApisModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ListOfApisViewModel,
            modelBinder: ListOfApisModelBinder,
            viewModelBinder: ListOfApisViewModelBinder
        });

        widgetService.registerWidgetEditor("listOfApis", {
            displayName: "List of APIs",
            category: "APIs",
            iconClass: "widget-icon widget-icon-api-management",
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ListOfApisEditor,
            handlerComponent: ListOfApisHandlers
        });

        widgetService.registerWidget("listOfApisTiles", {
            modelDefinition: ListOfApisModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ListOfApisViewModel,
            modelBinder: ListOfApisModelBinder,
            viewModelBinder: ListOfApisViewModelBinder
        });

        widgetService.registerWidgetEditor("listOfApisTiles", {
            displayName: "List of APIs (tiles)",
            category: "APIs",
            iconClass: "widget-icon widget-icon-api-management",
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ListOfApisEditor,
            handlerComponent: ListOfApisTilesHandlers
        });

        widgetService.registerWidget("listOfApisDropdown", {
            modelDefinition: ListOfApisModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ListOfApisViewModel,
            modelBinder: ListOfApisModelBinder,
            viewModelBinder: ListOfApisViewModelBinder
        });

        widgetService.registerWidgetEditor("listOfApisDropdown", {
            displayName: "List of APIs (dropdown)",
            category: "APIs",
            iconClass: "widget-icon widget-icon-api-management",
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ListOfApisEditor,
            handlerComponent: ListOfApisDropdownHandlers
        });
    }
}