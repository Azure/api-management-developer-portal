import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { OperationDetailsHandlers } from "../operationDetailsHandlers";
import { OperationDetailsEditor } from "./operationDetailsEditor";

export class OperationDetailsEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("operationDetailsEditor", OperationDetailsEditor);
        injector.bindToCollection("widgetHandlers", OperationDetailsHandlers, "operationDetailsHandlers");
    }
}