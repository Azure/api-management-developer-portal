import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { UserSignupHandlers } from "../userSignupHandlers";
import { UserSignupEditor } from "./userSignupEditor";

export class UserSignupEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("userSignupEditor", UserSignupEditor);
        injector.bindToCollection("widgetHandlers", UserSignupHandlers, "userSignupHandlers");
    }
}