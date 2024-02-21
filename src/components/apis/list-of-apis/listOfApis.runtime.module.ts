import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { ApiListRuntime } from "./react/runtime/ApiListRuntime";
import { registerCustomElement } from "@paperbits/react/customElements";

export class ListOfApisRuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("listOfApisRuntime", ApiListRuntime);
        registerCustomElement(ApiListRuntime, "fui-api-list-runtime", injector);
    }
}
