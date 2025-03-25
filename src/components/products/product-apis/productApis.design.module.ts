import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ComponentFlow } from "@paperbits/common/components";
import { ProductApisEditor } from "./ko/productApisEditor";
import { ProductApisHandlers, ProductApisTilesHandlers } from "./productApisHandlers";
import { ProductApisModel } from "./productApisModel";
import { ProductApisModelBinder } from "./productApisModelBinder";
import { ProductApisViewModel } from "./react/ProductApisViewModel";
import { ProductApisViewModelBinder } from "./productApisViewModelBinder";

export class ProductApisDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("productApisEditor", ProductApisEditor);
        injector.bindSingleton("productApisModelBinder", ProductApisModelBinder);
        injector.bindSingleton("productApisViewModelBinder", ProductApisViewModelBinder)
        injector.bindSingleton("productApisHandlers", ProductApisHandlers);
        injector.bindSingleton("productApisTilesHandlers", ProductApisTilesHandlers);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        const productApisWidget = {
            modelDefinition: ProductApisModel,
            componentBinder: ReactComponentBinder,
            componentDefinition: ProductApisViewModel,
            modelBinder: ProductApisModelBinder,
            viewModelBinder: ProductApisViewModelBinder,
            componentFlow: ComponentFlow.Block
        };

        widgetService.registerWidget("product-apis", productApisWidget);

        widgetService.registerWidgetEditor("product-apis", {
            displayName: "Product: APIs",
            category: "APIs",
            iconClass: "widget-icon widget-icon-api-management",
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ProductApisEditor,
            handlerComponent: ProductApisHandlers
        });

        widgetService.registerWidget("product-apis-tiles", productApisWidget);

        widgetService.registerWidgetEditor("product-apis-tiles", {
            displayName: "Product: APIs (tiles)",
            category: "APIs",
            iconClass: "widget-icon widget-icon-api-management",
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ProductApisEditor,
            handlerComponent: ProductApisTilesHandlers
        });
    }
}