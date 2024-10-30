import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { registerCustomElement } from "@paperbits/react/customElements";
import { ChangePasswordRuntime } from "./react/ChangePasswordRuntime";

export class ChangePasswordRuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("ChangePasswordRuntimeModule", ChangePasswordRuntime);
        registerCustomElement(ChangePasswordRuntime, "fui-change-password", injector);
    }
}
