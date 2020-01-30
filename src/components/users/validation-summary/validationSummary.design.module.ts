import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ValidationSummaryHandlers } from "./validationSummaryHandlers";
import { ValidationSummaryEditor } from "./ko/validationSummaryEditor";

export class ValidationSummaryDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("validationSummaryEditor", ValidationSummaryEditor);
        injector.bindToCollection("widgetHandlers", ValidationSummaryHandlers, "validationSummaryHandlers");
    }
}