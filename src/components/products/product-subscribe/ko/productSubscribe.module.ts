import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { ProductSubscribeHandlers } from "../productSubscribeHandlers";
import { ProductSubscribeModel } from "../productSubscribeModel";
import { ProductSubscribeModelBinder } from "../productSubscribeModelBinder";
import { ProductSubscribeEditor } from "./productSubscribeEditor";
import { ProductSubscribeViewModel } from "./productSubscribeViewModel";
import { ProductSubscribeViewModelBinder } from "./productSubscribeViewModelBinder";


export class ProductSubscribePublishModule implements IInjectorModule {
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

    }
}