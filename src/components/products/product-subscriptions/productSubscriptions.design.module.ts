import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ComponentFlow } from "@paperbits/common/components";
import { ProductSubscriptionsHandlers } from "./productSubscriptionsHandlers";
import { ProductSubscriptionsModel } from "./productSubscriptionsModel";
import { ProductSubscriptionsModelBinder } from "./productSubscriptionsModelBinder";
import { ProductSubscriptionsViewModel } from "./react/ProductSubscriptionsViewModel";
import { ProductSubscriptionsViewModelBinder } from "./productSubscriptionsViewModelBinder";

export class ProductSubscriptionsEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("productSubscriptionModelBinder", ProductSubscriptionsModelBinder);
        injector.bindSingleton("productSubscriptionViewModelBinder", ProductSubscriptionsViewModelBinder)
        injector.bindSingleton("productSubscriptionHandlers", ProductSubscriptionsHandlers);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("product-subscriptions", {
            modelDefinition: ProductSubscriptionsModel,
            componentBinder: ReactComponentBinder,
            componentDefinition: ProductSubscriptionsViewModel,
            modelBinder: ProductSubscriptionsModelBinder,
            viewModelBinder: ProductSubscriptionsViewModelBinder,
            componentFlow: ComponentFlow.Block
        });

        widgetService.registerWidgetEditor("product-subscriptions", {
            displayName: "Product: Subscriptions",
            category: "Products",
            iconClass: "widget-icon widget-icon-api-management",
            componentBinder: KnockoutComponentBinder,
            handlerComponent: ProductSubscriptionsHandlers
        });
    }
}