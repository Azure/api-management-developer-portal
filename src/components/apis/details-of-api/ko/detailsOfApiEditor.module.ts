import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { IWidgetHandler, IContentDropHandler } from "@paperbits/common/editing";
import { DetailsOfApiHandlers } from "../detailsOfApiHandlers";

export class DetailsOfApiEditorModule implements IInjectorModule {
    register(injector: IInjector): void {
        injector.bindSingleton("detailsOfApiHandlers", DetailsOfApiHandlers);

        const widgetHandlers:Array<IWidgetHandler> = injector.resolve("widgetHandlers");
        widgetHandlers.push(injector.resolve<DetailsOfApiHandlers>("detailsOfApiHandlers"));
    }
}