import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ClickCounterEditor } from "./react/clickCounterEditor";
import { ClickCounterHandlers } from "./clickCounterHandlers";
import { ClickCounterModelBinder } from "./clickCounterModelBinder";
import { ClickCounterViewModelBinder } from "./clickCounterViewModelBinder";
import { ClickCounter } from "./react/clickCounter";

export class ClickCounterDesignModule implements IInjectorModule {
  public register(injector: IInjector): void {
    injector.bind("clickCounterEditor", ClickCounterEditor);
    injector.bindToCollection("widgetHandlers", ClickCounterHandlers);
    injector.bind("clickCounter", ClickCounter);
    injector.bindToCollection("modelBinders", ClickCounterModelBinder);
    injector.bindToCollection("viewModelBinders", ClickCounterViewModelBinder);
  }
}
