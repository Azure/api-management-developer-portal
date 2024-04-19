import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { OperationList } from "./react/runtime/OperationList";
import { registerCustomElement } from "@paperbits/react/customElements";

export class OperationListRuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("operationListRuntime", OperationList);
        registerCustomElement(OperationList, "fui-operation-list", injector);
    }
}
