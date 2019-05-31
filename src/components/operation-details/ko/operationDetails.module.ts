import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ViewModelBinder } from "@paperbits/common/widgets";
import { OperationDetailsModelBinder } from "../operationDetailsModelBinder";
import { OperationDetailsViewModelBinder } from "./operationDetailsViewModelBinder";
import { IModelBinder } from "@paperbits/common/editing";

export class OperationDetailsModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("operationDetailsModelBinder", OperationDetailsModelBinder);
        const modelBinders = injector.resolve<IModelBinder[]>("modelBinders");
        modelBinders.push(injector.resolve("operationDetailsModelBinder"));

        injector.bind("operationDetailsViewModelBinder", OperationDetailsViewModelBinder);
        const viewModelBinders = injector.resolve<ViewModelBinder<any, any>[]>("viewModelBinders");
        viewModelBinders.push(injector.resolve("operationDetailsViewModelBinder"));
    }
}