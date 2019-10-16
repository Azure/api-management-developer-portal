import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ConfirmPasswordHandlers } from "../confirmPasswordHandlers";
import { ConfirmPasswordEditor } from "./confirmPasswordEditor";

export class ConfirmPasswordEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("confirmPassworEditor", ConfirmPasswordEditor);
        injector.bindToCollection("widgetHandlers", ConfirmPasswordHandlers, "confirmPassworHandlers");
    }
}