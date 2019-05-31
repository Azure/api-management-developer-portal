import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { IWidgetHandler } from "@paperbits/common/editing";
import { UserSignupHandlers } from "../userSignupHandlers";

export class UserSignupEditorModule implements IInjectorModule {
    register(injector: IInjector): void {
        injector.bindSingleton("userSignupHandlers", UserSignupHandlers);

        const widgetHandlers:Array<IWidgetHandler> = injector.resolve("widgetHandlers");
        widgetHandlers.push(injector.resolve<UserSignupHandlers>("userSignupHandlers"));
    }
}