import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { HtmlInjectionViewModel } from "./ko/htmlInjectionViewModel";
import { HTMLInjectionModelBinder } from "./htmlInjectionModelBinder";
import { HtmlInjectionViewModelBinder } from "./ko/htmlInjectionViewModelBinder";


export class HtmlInjectionPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {        
        injector.bind("widget", HtmlInjectionViewModel);
        injector.bindToCollection("modelBinders", HTMLInjectionModelBinder);
        injector.bindToCollection("viewModelBinders", HtmlInjectionViewModelBinder);
    }
}