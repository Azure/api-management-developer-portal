import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ProductSubscribeHandlers } from "../productSubscribeHandlers";
import { ProductSubscribeEditor } from "./productSubscribeEditor";
import { ProductSubscribeModelBinder } from "../productSubscribeModelBinder";
import { ProductSubscribeViewModelBinder } from "./productSubscribeViewModelBinder";
import { IWidgetService } from "@paperbits/common/widgets";
import { ProductSubscribeModel } from "../productSubscribeModel";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { ProductSubscribeViewModel } from "./productSubscribeViewModel";


export class ProductSubscribeEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("productSubscribeEditor", ProductSubscribeEditor);
        injector.bindSingleton("productSubscribeModelBinder", ProductSubscribeModelBinder);
        injector.bindSingleton("productSubscribeViewModelBinder", ProductSubscribeViewModelBinder)
        injector.bindSingleton("productSubscribeHandlers", ProductSubscribeHandlers);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("product-subscribe", {
            modelDefinition: ProductSubscribeModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ProductSubscribeViewModel,
            modelBinder: ProductSubscribeModelBinder,
            viewModelBinder: ProductSubscribeViewModelBinder
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