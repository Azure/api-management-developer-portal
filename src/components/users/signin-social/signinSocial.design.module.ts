import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { SignInSocialEditor } from "./ko/signinSocialEditor";
import { SigninSocialHandlers } from "./signinSocialHandlers";


export class SigninSocialEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("signInSocialEditor", SignInSocialEditor);
        injector.bindToCollection("widgetHandlers", SigninSocialHandlers, "signinSocialHandlers");
    }
}