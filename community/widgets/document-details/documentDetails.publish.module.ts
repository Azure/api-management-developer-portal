import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { DocumentDetailsViewModel } from "./ko/documentDetailsViewModel";
import { DocumentDetailsModelBinder } from "./documentDetailsModelBinder";
import { DocumentDetailsViewModelBinder } from "./ko/documentDetailsViewModelBinder";


export class DocumentDetailsPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {        
        injector.bind("documentDetails", DocumentDetailsViewModel);
        injector.bindToCollection("modelBinders", DocumentDetailsModelBinder);
        injector.bindToCollection("viewModelBinders", DocumentDetailsViewModelBinder);
    }
}