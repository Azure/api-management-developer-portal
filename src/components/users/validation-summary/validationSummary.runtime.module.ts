import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { registerCustomElement } from "@paperbits/react/customElements";
import { selector, ValidationSummaryRuntime } from "./react/ValidationSummaryRuntime";

export class ValidationSummaryRuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("ValidationSummaryRuntimeModule", ValidationSummaryRuntime);
        registerCustomElement(ValidationSummaryRuntime, selector, injector);
    }
}
