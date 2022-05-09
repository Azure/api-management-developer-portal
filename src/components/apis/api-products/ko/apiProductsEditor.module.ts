import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ApiProductsHandlers, ApiProductsDropdownHandlers, ApiProductsTilesHandlers } from "../apiProductsHandlers";
import { ApiProductsEditor } from "./apiProductsEditor";

export class ApiProductsEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("apiProductsEditor", ApiProductsEditor);
        injector.bindToCollection("widgetHandlers", ApiProductsHandlers, "apiProductsHandlers");
        injector.bindToCollection("widgetHandlers", ApiProductsDropdownHandlers, "apiProductsDropdownHandlers");
        injector.bindToCollection("widgetHandlers", ApiProductsTilesHandlers, "apiProductsTilesHandlers");
    }
}