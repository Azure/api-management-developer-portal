import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { CustomWidgetInstanceViewModel } from "./ko/customWidgetInstanceViewModel";
import { CustomWidgetInstanceModelBinder } from "./customWidgetInstanceModelBinder";
import { CustomWidgetInstanceViewModelBinder } from "./ko/customWidgetInstanceViewModelBinder";


export class CustomWidgetInstancePublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("widget", CustomWidgetInstanceViewModel);
        injector.bindToCollection("modelBinders", CustomWidgetInstanceModelBinder);
        injector.bindToCollection("viewModelBinders", CustomWidgetInstanceViewModelBinder);
    }
}