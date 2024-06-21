import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { registerCustomElement } from "@paperbits/react/customElements";
import { OperationDetailsRuntime } from "./react/runtime/OperationDetailsRuntime";

export class OperationDetailsRuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("operationDetailsRuntime", OperationDetailsRuntime);
        registerCustomElement(OperationDetailsRuntime, "fui-operation-details", injector);
    }
}