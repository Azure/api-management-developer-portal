import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { UserSubscriptionsHandlers } from "../userSubscriptionsHandlers";

export class UserSubscriptionsEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("widgetHandlers", UserSubscriptionsHandlers, "userSubscriptionsHandlers");
    }
}