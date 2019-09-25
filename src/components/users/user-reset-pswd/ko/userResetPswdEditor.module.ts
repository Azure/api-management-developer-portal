import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { UserResetPswdHandlers } from "../userResetPswdHandlers";
import { UserResetPswdEditor } from "./userResetPswdEditor";

export class UserResetPswdEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("userResetPswdEditor", UserResetPswdEditor);
        injector.bindToCollection("widgetHandlers", UserResetPswdHandlers, "userResetPswdHandlers");
    }
}