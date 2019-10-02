import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { HistoryOfApiHandlers } from "../historyOfApiHandlers";
import { HistoryOfApiEditor } from "./historyOfApiEditor";

export class HistoryOfApiEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("historyOfApiEditor", HistoryOfApiEditor);
        injector.bindToCollection("widgetHandlers", HistoryOfApiHandlers, "historyOfApiHandlers");
    }
}