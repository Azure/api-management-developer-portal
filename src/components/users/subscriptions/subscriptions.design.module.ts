import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { SubscriptionsHandlers } from "./subscriptionsHandlers";
import { SubscriptionsModelBinder } from "./subscriptionsModelBinder";
import { SubscriptionsModel } from "./subscriptionsModel";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { SubscriptionsViewModel } from "./react/SubscriptionsViewModel";
import { SubscriptionsViewModelBinder } from "./subscriptionsViewModelBinder";
import { IWidgetService } from "@paperbits/common/widgets";
import { ComponentFlow } from "@paperbits/common/components";

export class SubscriptionsDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("subscriptionsModelBinder", SubscriptionsModelBinder);
        injector.bindSingleton("subscriptionsViewModelBinder", SubscriptionsViewModelBinder)
        injector.bindSingleton("subscriptionsHandlers", SubscriptionsHandlers);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("subscriptions", {
            modelDefinition: SubscriptionsModel,
            componentBinder: ReactComponentBinder,
            componentDefinition: SubscriptionsViewModel,
            modelBinder: SubscriptionsModelBinder,
            viewModelBinder: SubscriptionsViewModelBinder,
            componentFlow: ComponentFlow.Block
        });

        widgetService.registerWidgetEditor("subscriptions", {
            displayName: "User: Subscriptions",
            category: "User",
            iconClass: "widget-icon widget-icon-api-management",
            handlerComponent: SubscriptionsHandlers
        });
    }
}