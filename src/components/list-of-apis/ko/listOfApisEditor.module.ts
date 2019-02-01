import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { IWidgetHandler, IContentDropHandler } from "@paperbits/common/editing";
import { ListOfApisHandlers } from "../listOfApisHandlers";

export class ListOfApisEditorModule implements IInjectorModule {
    register(injector: IInjector): void {
        injector.bindSingleton("listOfApisHandlers", ListOfApisHandlers);

        const widgetHandlers:Array<IWidgetHandler> = injector.resolve("widgetHandlers");
        widgetHandlers.push(injector.resolve<ListOfApisHandlers>("listOfApisHandlers"));
    }
}