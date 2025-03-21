import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ComponentFlow } from "@paperbits/common/components";
import { ProductSubscriptionsModel } from "./productSubscriptionsModel";
import { ProductSubscriptionsModelBinder } from "./productSubscriptionsModelBinder";
import { ProductSubscriptionsViewModel } from "./react/ProductSubscriptionsViewModel";
import { ProductSubscriptionsViewModelBinder } from "./productSubscriptionsViewModelBinder";

export class ProductSubscriptionsPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("productSubscriptionModelBinder", ProductSubscriptionsModelBinder);
        injector.bindSingleton("productSubscriptionViewModelBinder", ProductSubscriptionsViewModelBinder)

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("product-subscriptions", {
            modelDefinition: ProductSubscriptionsModel,
            componentBinder: ReactComponentBinder,
            componentDefinition: ProductSubscriptionsViewModel,
            modelBinder: ProductSubscriptionsModelBinder,
            viewModelBinder: ProductSubscriptionsViewModelBinder,
            componentFlow: ComponentFlow.Block
        });
    }
}