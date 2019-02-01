import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { IWidgetHandler } from "@paperbits/common/editing";
import { UserDetailsHandlers } from "../userDetailsHandlers";

export class UserDetailsEditorModule implements IInjectorModule {
    register(injector: IInjector): void {
        injector.bindSingleton("userDetailsHandlers", UserDetailsHandlers);

        const widgetHandlers:Array<IWidgetHandler> = injector.resolve("widgetHandlers");
        widgetHandlers.push(injector.resolve<UserDetailsHandlers>("userDetailsHandlers"));
    }
}