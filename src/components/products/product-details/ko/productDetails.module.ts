import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ViewModelBinder } from "@paperbits/common/widgets";
import { ProductDetailsModelBinder } from "../productDetailsModelBinder";
import { ProductDetailsViewModelBinder } from "./productDetailsViewModelBinder";
import { IModelBinder } from "@paperbits/common/editing";

export class ProductDetailsModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("productDetailsModelBinder", ProductDetailsModelBinder);
        const modelBinders = injector.resolve<Array<IModelBinder>>("modelBinders");
        modelBinders.push(injector.resolve("productDetailsModelBinder"));

        injector.bind("productDetailsViewModelBinder", ProductDetailsViewModelBinder);
        const viewModelBinders = injector.resolve<Array<ViewModelBinder<any, any>>>("viewModelBinders");
        viewModelBinders.push(injector.resolve("productDetailsViewModelBinder"));
    }
}