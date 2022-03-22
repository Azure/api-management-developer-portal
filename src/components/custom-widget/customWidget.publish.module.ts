import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { CustomWidgetViewModel } from "./ko/customWidgetViewModel";
import { CustomWidgetModelBinder } from "./customWidgetModelBinder";
import { CustomWidgetViewModelBinder } from "./ko/customWidgetViewModelBinder";


export class CustomWidgetPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("widget", CustomWidgetViewModel);
        injector.bindToCollection("modelBinders", CustomWidgetModelBinder);
        injector.bindToCollection("viewModelBinders", CustomWidgetViewModelBinder);
    }
}