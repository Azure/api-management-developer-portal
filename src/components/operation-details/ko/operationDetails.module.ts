import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { OperationDetailsModelBinder } from "../operationDetailsModelBinder";
import { OperationDetailsViewModelBinder } from "./operationDetailsViewModelBinder";


export class OperationDetailsModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("modelBinders", OperationDetailsModelBinder);
        injector.bindToCollection("viewModelBinders", OperationDetailsViewModelBinder);
    }
}