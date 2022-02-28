import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { ClickCounterRuntime } from "./react/clickCounterRuntime";

export class ClickCounterRuntimeModule implements IInjectorModule {
  public register(injector: IInjector): void {
    injector.bind("clickCounterRuntime", ClickCounterRuntime);
  }
}
