import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { BemoNavbarEditorViewModel } from "./ko/bemoNavbarEditorViewModel";
import { BemoNavbarHandlers } from "./bemoNavbarHandlers";
import { BemoNavbarViewModel, BemoNavbarViewModelBinder } from "./ko";
import { BemoNavbarModelBinder } from "./bemoNavbarModelBinder";

/**
 * Inversion of control module that registers design-time dependencies.
 */
export class BemoNavbarDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("bemoNavbar", BemoNavbarViewModel);
        injector.bind("bemoNavbarEditor", BemoNavbarEditorViewModel);
        injector.bindToCollection("modelBinders", BemoNavbarModelBinder);
        injector.bindToCollection("viewModelBinders", BemoNavbarViewModelBinder);
        injector.bindToCollection("widgetHandlers", BemoNavbarHandlers);
    }
}