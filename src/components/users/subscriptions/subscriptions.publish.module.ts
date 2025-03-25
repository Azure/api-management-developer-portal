import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ComponentFlow } from "@paperbits/common/components";
import { SubscriptionsModel } from "./subscriptionsModel";
import { SubscriptionsModelBinder } from "./subscriptionsModelBinder";
import { SubscriptionsViewModel } from "./react/SubscriptionsViewModel";
import { SubscriptionsViewModelBinder } from "./subscriptionsViewModelBinder";

export class SubscriptionsPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("subscriptionsModelBinder", SubscriptionsModelBinder);
        injector.bindSingleton("subscriptionsViewModelBinder", SubscriptionsViewModelBinder)

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("subscriptions", {
            modelDefinition: SubscriptionsModel,
            componentBinder: ReactComponentBinder,
            componentDefinition: SubscriptionsViewModel,
            modelBinder: SubscriptionsModelBinder,
            viewModelBinder: SubscriptionsViewModelBinder,
            componentFlow: ComponentFlow.Block
        });
    }
}