import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { registerCustomElement } from "@paperbits/react/customElements";
import { ApplicationsDetailsRuntime } from "./react/runtime/ApplicationsDetailsRuntime";

export class ApplicationDetailsRuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("applicationsDetailsRuntime", ApplicationsDetailsRuntime);
        registerCustomElement(ApplicationsDetailsRuntime, "fui-application-details", injector);
    }
}