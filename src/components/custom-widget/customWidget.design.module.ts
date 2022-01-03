import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { CustomWidgetEditorViewModel } from "./ko/customWidgetEditorViewModel";
import { CustomWidgetHandlers } from "./customWidgetHandlers";
import { CustomWidgetViewModel, CustomWidgetViewModelBinder } from "./ko";
import { CustomWidgetModelBinder } from ".";

export class CustomWidgetDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("widget", CustomWidgetViewModel);
        injector.bind("widgetEditor", CustomWidgetEditorViewModel);
        injector.bindToCollection("modelBinders", CustomWidgetModelBinder);
        injector.bindToCollection("viewModelBinders", CustomWidgetViewModelBinder);
        injector.bindToCollection("widgetHandlers", CustomWidgetHandlers);
    }
}