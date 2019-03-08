import { ListOfApisEditor } from "./listOfApisEditor";
import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ListOfApisHandlers } from "../listOfApisHandlers";

export class ListOfApisEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("listOfApisEditor", ListOfApisEditor);
        injector.bindToCollection("widgetHandlers", ListOfApisHandlers, "listOfApisHandlers");
    }
}