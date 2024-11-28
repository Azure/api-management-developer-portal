import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { ComponentFlow } from "@paperbits/common/components";
import { ProductDetailsModel } from "./productDetailsModel";
import { ProductDetailsModelBinder } from "./productDetailsModelBinder";
import { ProductDetailsViewModel } from "./react/ProductDetailsViewModel";
import { ProductDetailsViewModelBinder } from "./productDetailsViewModelBinder";

export class ProductDetailsPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("productDetailsModelBinder", ProductDetailsModelBinder);
        injector.bindSingleton("productDetailsViewModelBinder", ProductDetailsViewModelBinder)

        const widgetService = injector.resolve<IWidgetService>("widgetService");
    
        widgetService.registerWidget("product-details", {
            modelDefinition: ProductDetailsModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ProductDetailsViewModel,
            modelBinder: ProductDetailsModelBinder,
            viewModelBinder: ProductDetailsViewModelBinder,
            componentFlow: ComponentFlow.Block
        });
    }
}