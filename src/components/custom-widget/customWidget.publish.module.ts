import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { CustomWidgetViewModel, CustomWidgetViewModelBinder } from "./ko";
import { CustomWidgetModelBinder } from "./customWidgetModelBinder";

export class CustomWidgetPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("customWidgetScaffold", CustomWidgetViewModel);
        injector.bindToCollection("modelBinders", CustomWidgetModelBinder);
        injector.bindToCollection("viewModelBinders", CustomWidgetViewModelBinder);
    }
}
