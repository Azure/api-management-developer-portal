import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { ApiDetails } from "./react/runtime/ApiDetails";
import { registerCustomElement } from "@paperbits/react/customElements";

export class DetailsOfApiRuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("detailsOfApiRuntime", ApiDetails);
        registerCustomElement(ApiDetails, "fui-api-details", injector);
    }
}
