import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { CustomHtmlViewModel } from "./ko/customHtmlViewModel";
import { HTMLInjectionModelBinder } from "./customHtmlModelBinder";
import { CustomHtmlViewModelBinder } from "./ko/customHtmlViewModelBinder";


export class CustomHtmlPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {        
        injector.bind("customHtmlViewModel", CustomHtmlViewModel);
        injector.bindToCollection("modelBinders", HTMLInjectionModelBinder);
        injector.bindToCollection("viewModelBinders", CustomHtmlViewModelBinder);
    }
}