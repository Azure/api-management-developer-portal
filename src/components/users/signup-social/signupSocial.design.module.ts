import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { SignupSocialHandlers } from "./signupSocialHandlers";

export class SignupSocialDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("widgetHandlers", SignupSocialHandlers, "signupSocialHandlers");
    }
}