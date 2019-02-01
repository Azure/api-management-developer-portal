import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { IWidgetHandler } from "@paperbits/common/editing";
import { UserLoginHandlers } from "../userLoginHandlers";

export class UserLoginEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("userLoginHandlers", UserLoginHandlers);

        const widgetHandlers: IWidgetHandler[] = injector.resolve("widgetHandlers");
        widgetHandlers.push(injector.resolve<UserLoginHandlers>("userLoginHandlers"));
    }
}