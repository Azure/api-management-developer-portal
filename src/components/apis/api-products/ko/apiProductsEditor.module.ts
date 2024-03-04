import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { ApiProductsDropdownHandlers, ApiProductsHandlers, ApiProductsTilesHandlers } from "../apiProductsHandlers";
import { ApiProductsModel } from "../apiProductsModel";
import { ApiProductsModelBinder } from "../apiProductsModelBinder";
import { ApiProductsEditor } from "./apiProductsEditor";
import { ApiProductsViewModel } from "./apiProductsViewModel";
import { ApiProductsViewModelBinder } from "./apiProductsViewModelBinder";

export class ApiProductsDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("apiProductsEditor", ApiProductsEditor);
        injector.bindSingleton("apiProductsModelBinder", ApiProductsModelBinder);
        injector.bindSingleton("apiProductsViewModelBinder", ApiProductsViewModelBinder)
        injector.bindSingleton("apiProductsHandlers", ApiProductsHandlers);
        injector.bindSingleton("apiProductsDropdownHandlers", ApiProductsDropdownHandlers);
        injector.bindSingleton("apiProductsTilesHandlers", ApiProductsTilesHandlers);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        const apiProductsWidget = {
            modelDefinition: ApiProductsModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ApiProductsViewModel,
            modelBinder: ApiProductsModelBinder,
            viewModelBinder: ApiProductsViewModelBinder
        };

        widgetService.registerWidget("api-products", apiProductsWidget);

        widgetService.registerWidgetEditor("api-products", {
            displayName: "API: Products",
            category: "APIs",
            iconClass: "widget-icon widget-icon-api-management",
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ApiProductsEditor,
            handlerComponent: ApiProductsHandlers
        });

        widgetService.registerWidget("api-products-dropdown", apiProductsWidget);

        widgetService.registerWidgetEditor("api-products-dropdown", {
            displayName: "API: Products (dropdown)",
            category: "APIs",
            iconClass: "widget-icon widget-icon-api-management",
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ApiProductsEditor,
            handlerComponent: ApiProductsDropdownHandlers
        });

        widgetService.registerWidget("api-products-tiles", apiProductsWidget);

        widgetService.registerWidgetEditor("api-products-tiles", {
            displayName: "API: Products (tiles)",
            category: "APIs",
            iconClass: "widget-icon widget-icon-api-management",
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ApiProductsEditor,
            handlerComponent: ApiProductsTilesHandlers
        });
    }
}