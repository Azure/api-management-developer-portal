import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { registerCustomElement } from "@paperbits/react/customElements";
import { SignInRuntime } from "./react/SignInRuntime";

export class SignInRuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("SignInRuntimeModule", SignInRuntime);
        registerCustomElement(SignInRuntime, "fui-signin-runtime", injector);
    }
}
