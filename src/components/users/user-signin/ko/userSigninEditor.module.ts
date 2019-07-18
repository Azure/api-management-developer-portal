import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { UserSigninHandlers } from "../userSigninHandlers";

export class UserSigninEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("widgetHandlers", UserSigninHandlers, "userSigninHandlers");
    }
}