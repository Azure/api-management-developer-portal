import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { registerCustomElement } from "@paperbits/react/customElements";
import { ConfirmPasswordRuntime } from "./react/ConfirmPasswordRuntime";

export class ConfirmPasswordRuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("ConfirmPasswordRuntimeModule", ConfirmPasswordRuntime);
        registerCustomElement(ConfirmPasswordRuntime, "fui-confirm-password", injector);
    }
}
