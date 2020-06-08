import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { OperationDetailsModelBinder } from "./operationDetailsModelBinder";
import { OperationDetailsViewModelBinder } from "./ko/operationDetailsViewModelBinder";


export class OperationDetailsPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("modelBinders", OperationDetailsModelBinder);
        injector.bindToCollection("viewModelBinders", OperationDetailsViewModelBinder);
    }
}