import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { DocumentDetailsRuntime } from "./ko/runtime/document-details-runtime";


export class DocumentDetailsRuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("documentDetailsRuntime", DocumentDetailsRuntime);
    }
}