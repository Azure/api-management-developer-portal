import { MarkdownEditor } from "./markdownEditor";
import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { MarkdownHandlers } from "../markdownHandlers";

export class MarkdownEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("markdownEditor", MarkdownEditor);
        injector.bindToCollection("widgetHandlers", MarkdownHandlers, "markdownHandlers");
        
    }
}