import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { UserSigninSocialHandlers } from "../userSigninSocialHandlers";

export class UserSigninSocialEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("widgetHandlers", UserSigninSocialHandlers, "userSigninSocialHandlers");
    }
}