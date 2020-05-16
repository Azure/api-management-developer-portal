import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { DocumentDetailsEditor } from "./ko/documentDetailsEditorViewModel";
import { DocumentDetailsHandlers } from "./documentDetailsHandlers";
import { DocumentDetailsViewModel, DocumentDetailsViewModelBinder } from "./ko";
import { DocumentDetailsModelBinder } from "./documentDetailsModelBinder";


export class DocumentDetailsDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("documentDetails", DocumentDetailsViewModel);
        injector.bind("documentDetailsEditor", DocumentDetailsEditor);
        injector.bindToCollection("modelBinders", DocumentDetailsModelBinder);
        injector.bindToCollection("viewModelBinders", DocumentDetailsViewModelBinder);
        injector.bindToCollection("widgetHandlers", DocumentDetailsHandlers);
    }
}