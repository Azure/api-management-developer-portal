import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ViewModelBinder } from "@paperbits/common/widgets";
import { ProductSubscribeModelBinder } from "../productSubscribeModelBinder";
import { ProductSubscribeViewModelBinder } from "./productSubscribeViewModelBinder";
import { IModelBinder } from "@paperbits/common/editing";

export class ProductSubscribeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("productSubscribeModelBinder", ProductSubscribeModelBinder);
        const modelBinders = injector.resolve<IModelBinder[]>("modelBinders");
        modelBinders.push(injector.resolve("productSubscribeModelBinder"));

        injector.bind("productSubscribeViewModelBinder", ProductSubscribeViewModelBinder);
        const viewModelBinders = injector.resolve<ViewModelBinder<any, any>[]>("viewModelBinders");
        viewModelBinders.push(injector.resolve("productSubscribeViewModelBinder"));
    }
}