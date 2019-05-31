import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { IWidgetHandler } from "@paperbits/common/editing";
import { UserSubscriptionsHandlers } from "../userSubscriptionsHandlers";

export class UserSubscriptionsEditorModule implements IInjectorModule {
    register(injector: IInjector): void {
        injector.bindSingleton("userSubscriptionsHandlers", UserSubscriptionsHandlers);

        const widgetHandlers:Array<IWidgetHandler> = injector.resolve("widgetHandlers");
        widgetHandlers.push(injector.resolve<UserSubscriptionsHandlers>("userSubscriptionsHandlers"));
    }
}