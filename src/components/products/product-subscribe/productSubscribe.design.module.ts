import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ComponentFlow } from "@paperbits/common/components";
import { ProductSubscribeHandlers } from "./productSubscribeHandlers";
import { ProductSubscribeEditor } from "./ko/productSubscribeEditor";
import { ProductSubscribeModel } from "./productSubscribeModel";
import { ProductSubscribeModelBinder } from "./productSubscribeModelBinder";
import { ProductSubscribeViewModel } from "./react/ProductSubscribeViewModel";
import { ProductSubscribeViewModelBinder } from "./productSubscribeViewModelBinder";

export class ProductSubscribeDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("productSubscribeEditor", ProductSubscribeEditor);
        injector.bindSingleton("productSubscribeModelBinder", ProductSubscribeModelBinder);
        injector.bindSingleton("productSubscribeViewModelBinder", ProductSubscribeViewModelBinder)
        injector.bindSingleton("productSubscribeHandlers", ProductSubscribeHandlers);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("product-subscribe", {
            modelDefinition: ProductSubscribeModel,
            componentBinder: ReactComponentBinder,
            componentDefinition: ProductSubscribeViewModel,
            modelBinder: ProductSubscribeModelBinder,
            viewModelBinder: ProductSubscribeViewModelBinder,
            componentFlow: ComponentFlow.Block
        });

        widgetService.registerWidgetEditor("product-subscribe", {
            displayName: "Product: Subscribe form",
            category: "Products",
            iconClass: "widget-icon widget-icon-api-management",
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ProductSubscribeEditor,
            handlerComponent: ProductSubscribeHandlers
        });
    }
}