import { ListOfApisEditor } from "./ko/listOfApisEditor";
import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ComponentFlow } from "@paperbits/common/components";
import { ListOfApisModel } from "./listOfApisModel";
import { ListOfApisModelBinder } from "./listOfApisModelBinder";
import { ListOfApisViewModel } from "./react/ListOfApisViewModel";
import { ListOfApisViewModelBinder } from "./listOfApisViewModelBinder";
import { ListOfApisDropdownHandlers, ListOfApisHandlers, ListOfApisTilesHandlers } from "./listOfApisHandlers";

export class ListOfApisDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("listOfApisEditor", ListOfApisEditor);
        injector.bindSingleton("listOfApisModelBinder", ListOfApisModelBinder);
        injector.bindSingleton("listOfApisViewModelBinder", ListOfApisViewModelBinder)
        injector.bindSingleton("listOfApisHandlers", ListOfApisHandlers);
        injector.bindSingleton("listOfApisDropdownHandlers", ListOfApisDropdownHandlers)
        injector.bindSingleton("listOfApisTilesHandlers", ListOfApisTilesHandlers)

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

        widgetService.registerWidgetEditor("listOfApis", {
            displayName: "List of APIs",
            category: "APIs",
            iconClass: "widget-icon widget-icon-api-management",
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ListOfApisEditor,
            handlerComponent: ListOfApisHandlers
        });

        widgetService.registerWidget("listOfApisTiles", apiListWidget);

        widgetService.registerWidgetEditor("listOfApisTiles", {
            displayName: "List of APIs (tiles)",
            category: "APIs",
            iconClass: "widget-icon widget-icon-api-management",
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ListOfApisEditor,
            handlerComponent: ListOfApisTilesHandlers
        });

        widgetService.registerWidget("listOfApisDropdown", apiListWidget);

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