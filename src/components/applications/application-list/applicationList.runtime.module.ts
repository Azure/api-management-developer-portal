import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { registerCustomElement } from "@paperbits/react/customElements";
import { ApplicationListRuntime } from "./react/runtime/ApplicationListRuntime";

export class ApplicationListRuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("applicationListRuntime", ApplicationListRuntime);
        registerCustomElement(ApplicationListRuntime, "fui-application-list", injector);
    }
}