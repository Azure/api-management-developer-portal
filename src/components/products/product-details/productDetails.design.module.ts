import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ProductDetailsHandlers } from "./productDetailsHandlers";
import { ProductDetailsModel } from "./productDetailsModel";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { ProductDetailsModelBinder } from "./productDetailsModelBinder";
import { ProductDetailsViewModelBinder } from "./ko/productDetailsViewModelBinder";
import { ProductDetailsViewModel } from "./ko/productDetailsViewModel";
import { IWidgetService } from "@paperbits/common/widgets";

export class ProductDetailsDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("productDetails", ProductDetailsViewModel);
        injector.bindSingleton("productDetailsModelBinder", ProductDetailsModelBinder);
        injector.bindSingleton("productDetailsViewModelBinder", ProductDetailsViewModelBinder)
        injector.bindSingleton("productDetailsHandlers", ProductDetailsHandlers);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("product-details", {
            modelDefinition: ProductDetailsModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ProductDetailsViewModel,
            modelBinder: ProductDetailsModelBinder,
            viewModelBinder: ProductDetailsViewModelBinder
        });

        widgetService.registerWidgetEditor("product-details", {
            displayName: "Product: Details",
            category: "Products",
            iconClass: "widget-icon widget-icon-api-management",
            handlerComponent: ProductDetailsHandlers
        });
    }
}