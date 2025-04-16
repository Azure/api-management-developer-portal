import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { registerCustomElement } from "@paperbits/react/customElements";
import { ApplicationsListRuntime } from "./react/runtime/ApplicationsListRuntime";

export class ApplicationListRuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("applicationsListRuntime", ApplicationsListRuntime);
        registerCustomElement(ApplicationsListRuntime, "fui-application-list", injector);
    }
}