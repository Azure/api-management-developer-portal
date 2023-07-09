import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { ProductDetailsViewModel } from "./ko/productDetailsViewModel";
import { ProductDetailsViewModelBinder } from "./ko/productDetailsViewModelBinder";
import { ProductDetailsModel } from "./productDetailsModel";
import { ProductDetailsModelBinder } from "./productDetailsModelBinder";


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
            viewModelBinder: ProductDetailsViewModelBinder
        });
    }
}