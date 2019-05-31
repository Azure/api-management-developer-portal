import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ViewModelBinder } from "@paperbits/common/widgets";
import { OperationListModelBinder } from "../operationListModelBinder";
import { OperationListViewModelBinder } from "./operationListViewModelBinder";
import { IModelBinder } from "@paperbits/common/editing";

export class OperationListModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("operationListModelBinder", OperationListModelBinder);
        const modelBinders = injector.resolve<IModelBinder[]>("modelBinders");
        modelBinders.push(injector.resolve("operationListModelBinder"));

        injector.bind("operationListViewModelBinder", OperationListViewModelBinder);
        const viewModelBinders = injector.resolve<ViewModelBinder<any, any>[]>("viewModelBinders");
        viewModelBinders.push(injector.resolve("operationListViewModelBinder"));
    }
}