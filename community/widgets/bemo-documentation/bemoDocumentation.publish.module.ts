import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { BemoDocumentationViewModel } from "./ko/bemoDocumentationViewModel";
import { BemoDocumentationModelBinder } from "./bemoDocumentationModelBinder";
import { BemoDocumentationViewModelBinder } from "./ko/bemoDocumentationViewModelBinder";

export class BemoDocumentationPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("bemoDocumentation", BemoDocumentationViewModel);
        injector.bindToCollection("modelBinders", BemoDocumentationModelBinder);
        injector.bindToCollection("viewModelBinders", BemoDocumentationViewModelBinder);
    }
}