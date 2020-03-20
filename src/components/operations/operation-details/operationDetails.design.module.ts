import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { OperationDetailsHandlers } from "./operationDetailsHandlers";
import { OperationDetailsEditor } from "./ko/operationDetailsEditor";
import { OperationDetailsModelBinder } from "./operationDetailsModelBinder";
import { OperationDetailsViewModelBinder } from "./ko/operationDetailsViewModelBinder";


export class OperationDetailsDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("operationDetailsEditor", OperationDetailsEditor);
        injector.bindToCollection("widgetHandlers", OperationDetailsHandlers, "operationDetailsHandlers");
        injector.bindToCollection("modelBinders", OperationDetailsModelBinder);
        injector.bindToCollection("viewModelBinders", OperationDetailsViewModelBinder);
    }
}