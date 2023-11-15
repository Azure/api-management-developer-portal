import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ProductApisHandlers } from "../productApisHandlers";
import { ProductApisEditor } from "./productApisEditor";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { IWidgetService } from "@paperbits/common/widgets";
import { ProductApisModelBinder } from "../productApisModelBinder";
import { ProductApisViewModelBinder } from "./productApisViewModelBinder";
import { ProductApisViewModel } from "./productApisViewModel";
import { ProductApisModel } from "../productApisModel";


export class ProductApisEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("productApisEditor", ProductApisEditor);
        injector.bindSingleton("productApisModelBinder", ProductApisModelBinder);
        injector.bindSingleton("productApisViewModelBinder", ProductApisViewModelBinder)
        injector.bindSingleton("productApisHandlers", ProductApisHandlers);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("product-apis", {
            modelDefinition: ProductApisModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ProductApisViewModel,
            modelBinder: ProductApisModelBinder,
            viewModelBinder: ProductApisViewModelBinder
        });

        widgetService.registerWidgetEditor("product-apis", {
            displayName: "Product: APIs",
            category: "APIs",
            iconClass: "widget-icon widget-icon-api-management",
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ProductApisEditor,
            handlerComponent: ProductApisHandlers
        });

        widgetService.registerWidget("product-apis-tiles", {
            modelDefinition: ProductApisModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ProductApisViewModel,
            modelBinder: ProductApisModelBinder,
            viewModelBinder: ProductApisViewModelBinder
        });

        widgetService.registerWidgetEditor("product-apis-tiles", {
            displayName: "Product: APIs (tiles)",
            category: "APIs",
            iconClass: "widget-icon widget-icon-api-management",
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ProductApisEditor,
            handlerComponent: ProductApisHandlers
        });
    }
}