import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { ProductListModel } from "../productListModel";
import { ProductListModelBinder } from "../productListModelBinder";
import { ProductListViewModel } from "./productListViewModel";
import { ProductListViewModelBinder } from "./productListViewModelBinder";


export class ProductListPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("productListModelBinder", ProductListModelBinder);
        injector.bindSingleton("productListViewModelBinder", ProductListViewModelBinder)
        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("product-list", {
            modelDefinition: ProductListModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ProductListViewModel,
            modelBinder: ProductListModelBinder,
            viewModelBinder: ProductListViewModelBinder
        });

        widgetService.registerWidget("productListDropdown", {
            modelDefinition: ProductListModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ProductListViewModel,
            modelBinder: ProductListModelBinder,
            viewModelBinder: ProductListViewModelBinder
        });

        widgetService.registerWidget("productListTiles", {
            modelDefinition: ProductListModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ProductListViewModel,
            modelBinder: ProductListModelBinder,
            viewModelBinder: ProductListViewModelBinder
        });
    }
}