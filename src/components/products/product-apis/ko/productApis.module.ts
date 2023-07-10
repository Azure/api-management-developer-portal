import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ProductApisModelBinder } from "../productApisModelBinder";
import { ProductApisViewModelBinder } from "./productApisViewModelBinder";
import { ProductApisViewModel } from "./productApisViewModel";
import { ProductApisModel } from "../productApisModel";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { IWidgetService } from "@paperbits/common/widgets";


export class ProductApisPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("productApisModelBinder", ProductApisModelBinder);
        injector.bindSingleton("productApisViewModelBinder", ProductApisViewModelBinder)

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("product-apis", {
            modelDefinition: ProductApisModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ProductApisViewModel,
            modelBinder: ProductApisModelBinder,
            viewModelBinder: ProductApisViewModelBinder
        });

        widgetService.registerWidget("product-apis-tiles", {
            modelDefinition: ProductApisModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ProductApisViewModel,
            modelBinder: ProductApisModelBinder,
            viewModelBinder: ProductApisViewModelBinder
        });
    }
}