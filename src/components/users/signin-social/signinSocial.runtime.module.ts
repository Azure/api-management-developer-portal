import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { registerCustomElement } from "@paperbits/react/customElements";
import { SignInAadRuntime } from "./react/SignInAadRuntime";
import { SignInAadB2cRuntime } from "./react/SignInAadB2cRuntime";

export class SignInSocialRuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("SignInAadRuntimeModule", SignInAadRuntime);
        registerCustomElement(SignInAadRuntime, "fui-signin-aad-runtime", injector);

        injector.bind("SignInAadB2cRuntimeModule", SignInAadB2cRuntime);
        registerCustomElement(SignInAadB2cRuntime, "fui-signin-aadb2c-runtime", injector);
    }
}
