import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { SubscriptionsHandlers } from "./subscriptionsHandlers";
import { SubscriptionsModelBinder } from "./subscriptionsModelBinder";
import { SubscriptionsModel } from "./subscriptionsModel";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { SubscriptionsViewModel } from "./ko/subscriptionsViewModel";
import { SubscriptionsViewModelBinder } from "./ko/subscriptionsViewModelBinder";
import { IWidgetService } from "@paperbits/common/widgets";

export class SubscriptionsDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("subscriptionsModelBinder", SubscriptionsModelBinder);
        injector.bindSingleton("subscriptionsViewModelBinder", SubscriptionsViewModelBinder)
        injector.bindSingleton("subscriptionsHandlers", SubscriptionsHandlers);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("subscriptions", {
            modelDefinition: SubscriptionsModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: SubscriptionsViewModel,
            modelBinder: SubscriptionsModelBinder,
            viewModelBinder: SubscriptionsViewModelBinder
        });

        widgetService.registerWidgetEditor("subscriptions", {
            displayName: "User: Subscriptions",
            category: "User",
            iconClass: "widget-icon widget-icon-api-management",
            handlerComponent: SubscriptionsHandlers
        });
    }
}