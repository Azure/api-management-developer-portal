import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { registerCustomElement } from "@paperbits/react/customElements";
import { SignUpAadRuntime } from "./react/SignUpAadRuntime";

export class SignUpAadRuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("SignUpAadRuntimeModule", SignUpAadRuntime);
        registerCustomElement(SignUpAadRuntime, "fui-signup-aad-runtime", injector);
    }
}
