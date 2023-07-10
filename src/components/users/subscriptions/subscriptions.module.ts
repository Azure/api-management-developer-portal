import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { SubscriptionsModelBinder } from "./subscriptionsModelBinder";
import { SubscriptionsViewModelBinder } from "./ko/subscriptionsViewModelBinder";
import { IWidgetService } from "@paperbits/common/widgets";
import { SubscriptionsModel } from "./subscriptionsModel";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { SubscriptionsViewModel } from "./ko/subscriptionsViewModel";

export class SubscriptionsPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("subscriptionsModelBinder", SubscriptionsModelBinder);
        injector.bindSingleton("subscriptionsViewModelBinder", SubscriptionsViewModelBinder)

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("subscriptions", {
            modelDefinition: SubscriptionsModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: SubscriptionsViewModel,
            modelBinder: SubscriptionsModelBinder,
            viewModelBinder: SubscriptionsViewModelBinder
        });
    }
}