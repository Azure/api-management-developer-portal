import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { ApisListV2Runtime } from "./apisListV2Runtime";
import { registerCustomElement } from "@paperbits/react/customElements";

export class ApisListV2RuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("apisListV2Runtime", ApisListV2Runtime);
        registerCustomElement(ApisListV2Runtime, "apis-list-v2-runtime", injector);
    }
}
