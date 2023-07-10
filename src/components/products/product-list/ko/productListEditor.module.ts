import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { ProductListDropdownHandlers, ProductListHandlers, ProductListTilesHandlers } from "../productListHandlers";
import { ProductListModel } from "../productListModel";
import { ProductListModelBinder } from "../productListModelBinder";
import { ProductListEditor } from "./productListEditor";
import { ProductListViewModel } from "./productListViewModel";
import { ProductListViewModelBinder } from "./productListViewModelBinder";


export class ProductListEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("productListEditor", ProductListEditor);
        injector.bindSingleton("productListModelBinder", ProductListModelBinder);
        injector.bindSingleton("productListViewModelBinder", ProductListViewModelBinder)
        injector.bindSingleton("productListHandlers", ProductListHandlers);
        injector.bindSingleton("productListDropdownHandlers", ProductListDropdownHandlers)
        injector.bindSingleton("productListTilesHandlers", ProductListTilesHandlers)

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("product-list", {
            modelDefinition: ProductListModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ProductListViewModel,
            modelBinder: ProductListModelBinder,
            viewModelBinder: ProductListViewModelBinder
        });

        widgetService.registerWidgetEditor("product-list", {
            displayName: "List of products",
            category: "Products",
            iconClass: "widget-icon widget-icon-api-management",
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ProductListEditor,
            handlerComponent: ProductListHandlers
        });

        widgetService.registerWidget("productListDropdown", {
            modelDefinition: ProductListModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ProductListViewModel,
            modelBinder: ProductListModelBinder,
            viewModelBinder: ProductListViewModelBinder
        });

        widgetService.registerWidgetEditor("productListDropdown", {
            displayName: "List of products (dropdown)",
            category: "Products",
            iconClass: "widget-icon widget-icon-api-management",
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ProductListEditor,
            handlerComponent: ProductListDropdownHandlers
        });

        widgetService.registerWidget("productListTiles", {
            modelDefinition: ProductListModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ProductListViewModel,
            modelBinder: ProductListModelBinder,
            viewModelBinder: ProductListViewModelBinder
        });

        widgetService.registerWidgetEditor("productListTiles", {
            displayName: "List of products (tiles)",
            category: "Products",
            iconClass: "widget-icon widget-icon-api-management",
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ProductListEditor,
            handlerComponent: ProductListTilesHandlers
        });
    }
}