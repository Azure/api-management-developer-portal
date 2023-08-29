import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { ProductDetailsPageModelBinder } from "../productDetailsPageModelBinder";
import { ProductDetailsPageViewModelBinder } from "./productDetailsPageViewModelBinder";
import { ProductDetailsPageModel } from "../productDetailsPageModel";
import { ProductDetailsPageViewModel } from "./productDetailsPageViewModel";
import { IWidgetService } from "@paperbits/common/widgets";
import { KnockoutComponentBinder } from "@paperbits/core/ko";

export class ProductDetailsPageModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("modelBinders", ProductDetailsPageModelBinder);
        injector.bindToCollection("viewModelBinders", ProductDetailsPageViewModelBinder);
    
        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("product-details-page", {
            modelDefinition: ProductDetailsPageModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ProductDetailsPageViewModel,
            modelBinder: ProductDetailsPageModelBinder,
            viewModelBinder: ProductDetailsPageViewModelBinder
        });
    
        widgetService.registerWidgetEditor("product-details-page", {
            displayName: "Product Details Page",
            category: "Products",
            iconClass: "widget-icon widget-icon-api-management",
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ProductDetailsPageViewModel,
            handlerComponent: ProductDetailsPageViewModelBinder
        });
    }
}