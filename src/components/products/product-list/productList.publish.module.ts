import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ComponentFlow } from "@paperbits/common/components";
import { ProductListModel } from "./productListModel";
import { ProductListModelBinder } from "./productListModelBinder";
import { ProductListViewModel } from "./react/ProductListViewModel";
import { ProductListViewModelBinder } from "./productListViewModelBinder";

export class ProductListPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("productListModelBinder", ProductListModelBinder);
        injector.bindSingleton("productListViewModelBinder", ProductListViewModelBinder)
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
        widgetService.registerWidget("productListDropdown", productListWidget);
        widgetService.registerWidget("productListTiles", productListWidget);
    }
}