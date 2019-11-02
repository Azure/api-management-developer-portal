import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { UserSignupSocialHandlers } from "../userSignupSocialHandlers";

export class UserSignupSocialEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("widgetHandlers", UserSignupSocialHandlers, "userSignupSocialHandlers");
    }
}