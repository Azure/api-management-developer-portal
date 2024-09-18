import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { registerCustomElement } from "@paperbits/react/customElements";
import { ApiHistory } from "./react/runtime/ApiHistory";

export class HistoryOfApiRuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("historyOfApiRuntime", ApiHistory);
        registerCustomElement(ApiHistory, "fui-api-history", injector);
    }
}