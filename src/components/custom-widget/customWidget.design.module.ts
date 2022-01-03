import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { CustomWidgetHandlers } from "./customWidgetHandlers";
import { CustomWidgetEditorViewModel, CustomWidgetViewModel, CustomWidgetViewModelBinder } from "./ko";
import { CustomWidgetModelBinder } from ".";

export class CustomWidgetDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("customWidget", CustomWidgetViewModel);
        injector.bind("customWidgetEditor", CustomWidgetEditorViewModel);
        injector.bindToCollection("modelBinders", CustomWidgetModelBinder);
        injector.bindToCollection("viewModelBinders", CustomWidgetViewModelBinder);
        injector.bindToCollection("widgetHandlers", CustomWidgetHandlers);
    }
}