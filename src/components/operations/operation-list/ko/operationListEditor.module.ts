import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { OperationListHandlers } from "../operationListHandlers";
import { OperationListEditor } from "./operationListEditor";

export class OperationListEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("operationListEditor", OperationListEditor);
        injector.bindToCollection("widgetHandlers", OperationListHandlers, "operationListHandlers");
    }
}