import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { OperationListModelBinder } from "../operationListModelBinder";
import { OperationListViewModelBinder } from "./operationListViewModelBinder";


export class OperationListModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("modelBinders", OperationListModelBinder);
        injector.bindToCollection("viewModelBinders", OperationListViewModelBinder);
    }
}