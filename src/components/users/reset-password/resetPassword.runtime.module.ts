import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { registerCustomElement } from "@paperbits/react/customElements";
import { ResetPasswordRuntime } from "./react/ResetPasswordRuntime";

export class ResetPasswordRuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("ResetPasswordRuntimeModule", ResetPasswordRuntime);
        registerCustomElement(ResetPasswordRuntime, "fui-reset-password", injector);
    }
}
