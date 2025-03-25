import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { registerCustomElement } from "@paperbits/react/customElements";
import { SignUpRuntime } from "./react/runtime/SignUpRuntime";

export class SignUpRuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("SignUpRuntimeModule", SignUpRuntime);
        registerCustomElement(SignUpRuntime, "fui-signup-runtime", injector);
    }
}
