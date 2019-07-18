import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { UserSignupHandlers } from "../userSignupHandlers";

export class UserSignupEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("widgetHandlers", UserSignupHandlers, "userSignupHandlers");
    }
}