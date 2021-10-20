import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { BemoDocumentationEditor } from "./ko/bemoDocumentationEditorViewModel";
import { BemoDocumentationHandlers } from "./bemoDocumentationHandlers";
import { BemoDocumentationViewModel, BemoDocumentationViewModelBinder } from "./ko";
import { BemoDocumentationModelBinder } from "./bemoDocumentationModelBinder";

export class BemoDocumentationDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("bemoDocumentation", BemoDocumentationViewModel);
        injector.bind("bemoDocumentationEditor", BemoDocumentationEditor);
        injector.bindToCollection("modelBinders", BemoDocumentationModelBinder);
        injector.bindToCollection("viewModelBinders", BemoDocumentationViewModelBinder);
        injector.bindToCollection("widgetHandlers", BemoDocumentationHandlers);
    }
}