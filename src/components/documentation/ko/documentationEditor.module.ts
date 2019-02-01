import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { IWidgetHandler } from "@paperbits/common/editing";
import { DocumentationHandlers } from "../documentationHandlers";

export class DocumentationEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("documentationHandlers", DocumentationHandlers);

        const widgetHandlers: IWidgetHandler[] = injector.resolve("widgetHandlers");
        widgetHandlers.push(injector.resolve<DocumentationHandlers>("documentationHandlers"));
    }
}