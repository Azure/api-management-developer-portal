import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ResetPasswordHandlers } from "./resetPasswordHandlers";
import { ResetPasswordEditor } from "./ko/resetPasswordEditor";

export class ResetPasswordDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("resetPasswordEditor", ResetPasswordEditor);
        injector.bindToCollection("widgetHandlers", ResetPasswordHandlers, "resetPasswordHandlers");
    }
}