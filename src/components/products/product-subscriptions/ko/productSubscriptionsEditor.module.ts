import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { ProductSubscriptionsHandlers } from "../productSubscriptionsHandlers";
import { ProductSubscriptionsModel } from "../productSubscriptionsModel";
import { ProductSubscriptionsModelBinder } from "../productSubscriptionsModelBinder";
import { ProductSubscriptionsViewModel } from "./productSubscriptionsViewModel";
import { ProductSubscriptionsViewModelBinder } from "./productSubscriptionsViewModelBinder";


export class ProductSubscriptionsEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("productSubscriptionModelBinder", ProductSubscriptionsModelBinder);
        injector.bindSingleton("productSubscriptionViewModelBinder", ProductSubscriptionsViewModelBinder)
        injector.bindSingleton("productSubscriptionHandlers", ProductSubscriptionsHandlers);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("product-subscriptions", {
            modelDefinition: ProductSubscriptionsModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ProductSubscriptionsViewModel,
            modelBinder: ProductSubscriptionsModelBinder,
            viewModelBinder: ProductSubscriptionsViewModelBinder
        });

        widgetService.registerWidgetEditor("product-subscriptions", {
            displayName: "Product: Subscriptions",
            category: "Products",
            iconClass: "widget-icon widget-icon-api-management",
            handlerComponent: ProductSubscriptionsHandlers
        });
    }
}