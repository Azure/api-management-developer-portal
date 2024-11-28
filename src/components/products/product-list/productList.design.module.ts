import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ComponentFlow } from "@paperbits/common/components";
import { ProductListEditor } from "./ko/productListEditor";
import { ProductListModel } from "./productListModel";
import { ProductListModelBinder } from "./productListModelBinder";
import { ProductListViewModel } from "./react/ProductListViewModel";
import { ProductListViewModelBinder } from "./productListViewModelBinder";
import { ProductListDropdownHandlers, ProductListHandlers, ProductListTilesHandlers } from "./productListHandlers";

export class ProductListEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("productListEditor", ProductListEditor);
        injector.bindSingleton("productListModelBinder", ProductListModelBinder);
        injector.bindSingleton("productListViewModelBinder", ProductListViewModelBinder)
        injector.bindSingleton("productListHandlers", ProductListHandlers);
        injector.bindSingleton("productListDropdownHandlers", ProductListDropdownHandlers)
        injector.bindSingleton("productListTilesHandlers", ProductListTilesHandlers)

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        const productListWidget = {
            modelDefinition: ProductListModel,
            componentBinder: ReactComponentBinder,
            componentDefinition: ProductListViewModel,
            modelBinder: ProductListModelBinder,
            viewModelBinder: ProductListViewModelBinder,
            componentFlow: ComponentFlow.Block
        };

        widgetService.registerWidget("product-list", productListWidget);

        widgetService.registerWidgetEditor("product-list", {
            displayName: "List of products",
            category: "Products",
            iconClass: "widget-icon widget-icon-api-management",
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ProductListEditor,
            handlerComponent: ProductListHandlers
        });

        widgetService.registerWidget("productListDropdown", productListWidget);

        widgetService.registerWidgetEditor("productListDropdown", {
            displayName: "List of products (dropdown)",
            category: "Products",
            iconClass: "widget-icon widget-icon-api-management",
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ProductListEditor,
            handlerComponent: ProductListDropdownHandlers
        });

        widgetService.registerWidget("productListTiles", productListWidget);

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