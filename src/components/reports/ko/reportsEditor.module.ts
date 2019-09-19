import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ReportsHandlers } from "../reportsHandlers";
import { ReportsEditor } from "./reportsEditor";

export class ReportsEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("reportsEditor", ReportsEditor);
        injector.bindToCollection("widgetHandlers", ReportsHandlers, "reportsHandlers");
    }
}