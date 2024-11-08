import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { SubscriptionsModelBinder } from "./subscriptionsModelBinder";
import { SubscriptionsViewModelBinder } from "./subscriptionsViewModelBinder";
import { IWidgetService } from "@paperbits/common/widgets";
import { SubscriptionsModel } from "./subscriptionsModel";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { SubscriptionsViewModel } from "./react/SubscriptionsViewModel";
import { ComponentFlow } from "@paperbits/common/components";

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