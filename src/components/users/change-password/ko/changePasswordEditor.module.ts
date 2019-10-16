import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ChangePasswordHandlers } from "../changePasswordHandlers";
import { ChangePasswordEditor } from "./changePasswordEditor";

export class ChangePasswordEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("changePasswordEditor", ChangePasswordEditor);
        injector.bindToCollection("widgetHandlers", ChangePasswordHandlers, "changePasswordHandlers");
    }
}