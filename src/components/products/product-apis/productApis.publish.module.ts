import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ComponentFlow } from "@paperbits/common/components";
import { ProductApisModel } from "./productApisModel";
import { ProductApisModelBinder } from "./productApisModelBinder";
import { ProductApisViewModel } from "./react/ProductApisViewModel";
import { ProductApisViewModelBinder } from "./productApisViewModelBinder";

export class ProductApisPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("productApisModelBinder", ProductApisModelBinder);
        injector.bindSingleton("productApisViewModelBinder", ProductApisViewModelBinder)

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
        widgetService.registerWidget("product-apis-tiles", productApisWidget);
    }
}