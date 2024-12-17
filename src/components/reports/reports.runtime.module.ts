import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { registerCustomElement } from "@paperbits/react/customElements";
import { ReportsRuntime } from "./react/runtime/ReportsRuntime";

export class ReportsRuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("ReportsRuntimeModule", ReportsRuntime);
        registerCustomElement(ReportsRuntime, "fui-reports-runtime", injector);
    }
}
