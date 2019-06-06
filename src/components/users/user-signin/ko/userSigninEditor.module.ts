import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { IWidgetHandler } from "@paperbits/common/editing";
import { UserSigninHandlers } from "../userSigninHandlers";

export class UserSigninEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("userSigninHandlers", UserSigninHandlers);

        const widgetHandlers: IWidgetHandler[] = injector.resolve("widgetHandlers");
        widgetHandlers.push(injector.resolve<UserSigninHandlers>("userSigninHandlers"));
    }
}