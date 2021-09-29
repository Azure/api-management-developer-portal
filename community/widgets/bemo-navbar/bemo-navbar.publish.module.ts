import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { BemoNavbarViewModel } from "./ko/bemoNavbarViewModel";
import { BemoNavbarModelBinder } from "./bemoNavbarModelBinder";
import { BemoNavbarViewModelBinder } from "./ko/bemoNavbarViewModelBinder";

/**
* Inversion of control module that registers publish-time dependencies.
*/
export class BemoNavbarPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("bemoNavbar", BemoNavbarViewModel);
        injector.bindToCollection("modelBinders", BemoNavbarModelBinder);
        injector.bindToCollection("viewModelBinders", BemoNavbarViewModelBinder);
    }
}