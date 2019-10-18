import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ValidationErrorHandlers } from "../validationErrorHandlers";
import { ValidationErrorEditor } from "./validationErrorEditor";

export class ValidationErrorEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("validationErrorEditor", ValidationErrorEditor);
        injector.bindToCollection("widgetHandlers", ValidationErrorHandlers, "validationErrorsHandlers");
    }
}