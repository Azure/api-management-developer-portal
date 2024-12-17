import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ComponentFlow } from "@paperbits/common/components";
import { ProductDetailsHandlers } from "./productDetailsHandlers";
import { ProductDetailsModel } from "./productDetailsModel";
import { ProductDetailsModelBinder } from "./productDetailsModelBinder";
import { ProductDetailsViewModel } from "./react/ProductDetailsViewModel";
import { ProductDetailsViewModelBinder } from "./productDetailsViewModelBinder";

export class ProductDetailsDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("productDetails", ProductDetailsViewModel);
        injector.bindSingleton("productDetailsModelBinder", ProductDetailsModelBinder);
        injector.bindSingleton("productDetailsViewModelBinder", ProductDetailsViewModelBinder)
        injector.bindSingleton("productDetailsHandlers", ProductDetailsHandlers);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("product-details", {
            modelDefinition: ProductDetailsModel,
            componentBinder: ReactComponentBinder,
            componentDefinition: ProductDetailsViewModel,
            modelBinder: ProductDetailsModelBinder,
            viewModelBinder: ProductDetailsViewModelBinder,
            componentFlow: ComponentFlow.Block
        });

        widgetService.registerWidgetEditor("product-details", {
            displayName: "Product: Details",
            category: "Products",
            iconClass: "widget-icon widget-icon-api-management",
            componentBinder: KnockoutComponentBinder,
            handlerComponent: ProductDetailsHandlers
        });
    }
}