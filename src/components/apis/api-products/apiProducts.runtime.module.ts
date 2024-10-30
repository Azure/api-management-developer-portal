import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { registerCustomElement } from "@paperbits/react/customElements";
import { ApiProductsRuntime } from "./react/runtime/ApiProductsRuntime";

export class ApiProductsRuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("apiProductsRuntime", ApiProductsRuntime);
        registerCustomElement(ApiProductsRuntime, "fui-api-products-runtime", injector);
    }
}