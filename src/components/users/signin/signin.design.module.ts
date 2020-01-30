import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { SigninHandlers } from "./signinHandlers";

export class SigninDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("widgetHandlers", SigninHandlers, "signinHandlers");
    }
}