import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { UserDetailsHandlers } from "../userDetailsHandlers";

export class UserDetailsEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("widgetHandlers", UserDetailsHandlers);
    }
}