import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { ApiDetailsPageHandlers } from "../apiDetailsPageHandlers";
import { ApiDetailsPageEditor } from "./apiDetailsPageEditor";

export class ApiDetailsPageEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("apiDetailsPageEditor", ApiDetailsPageEditor);
        injector.bindToCollection("widgetHandlers", ApiDetailsPageHandlers, "apiDetailsPageHandlers");
    }
}