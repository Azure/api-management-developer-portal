import { IInjector, IInjectorModule } from "@paperbits/common/injection";
// import { ApiListRuntime } from "./react/runtime/ApiListRuntime";
import { registerCustomElement } from "@paperbits/react/customElements";
import { ApiList } from "../../../common/api-list/ApiList";

export class ListOfApisRuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("listOfApisRuntime", ApiList);
        registerCustomElement(ApiList, "fui-api-list-runtime", injector);

        // injector.bind("listOfApisRuntime", ApiListRuntime);
        // registerCustomElement(ApiListRuntime, "fui-api-list-runtime", injector);
    }
}
