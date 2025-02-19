import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { registerCustomElement } from "@paperbits/react/customElements";
import { ProfileRuntime } from "./react/runtime/ProfileRuntime";

export class ProfileRuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("ProfileRuntimeModule", ProfileRuntime);
        registerCustomElement(ProfileRuntime, "fui-profile-runtime", injector);
    }
}
