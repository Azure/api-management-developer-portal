import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { registerCustomElement } from "@paperbits/react/customElements";
import { ApiDetails } from "./react/ApiDetails";

export class DetailsOfApiRuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("detailsOfApiRuntime", ApiDetails);
        registerCustomElement(ApiDetails, "fui-api-details", injector);
    }
}