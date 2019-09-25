import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { UserResetHandlers } from "../userResetHandlers";
import { UserResetEditor } from "./userResetEditor";

export class UserResetEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("userResetEditor", UserResetEditor);
        injector.bindToCollection("widgetHandlers", UserResetHandlers, "userResetHandlers");
    }
}