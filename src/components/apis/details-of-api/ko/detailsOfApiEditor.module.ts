import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { DetailsOfApiHandlers } from "../detailsOfApiHandlers";
import { DetailsOfApiEditor } from "./detailsOfApiEditor";

export class DetailsOfApiEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("detailsOfApiEditor", DetailsOfApiEditor);
        injector.bindToCollection("widgetHandlers", DetailsOfApiHandlers, "detailsOfApiHandlers");
    }
}