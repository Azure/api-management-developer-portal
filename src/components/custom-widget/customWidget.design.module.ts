import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { CustomWidgetEditorViewModel, CustomWidgetViewModel, CustomWidgetViewModelBinder } from "./ko";
import { CustomWidgetModelBinder } from ".";

export class CustomWidgetDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("customWidgetScaffold", CustomWidgetViewModel);
        injector.bind("customWidgetScaffoldEditor", CustomWidgetEditorViewModel);
        injector.bindToCollection("modelBinders", CustomWidgetModelBinder);
        injector.bindToCollection("viewModelBinders", CustomWidgetViewModelBinder);
    }
}