import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { registerCustomElement } from "@paperbits/react/customElements";
import { OperationListRuntime } from "./react/runtime/OperationListRuntime";

export class OperationListRuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("operationListRuntime", OperationListRuntime);
        registerCustomElement(OperationListRuntime, "fui-operation-list", injector);
    }
}