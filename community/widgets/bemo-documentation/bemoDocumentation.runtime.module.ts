import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { BemoDocumentationRuntime } from "./ko/runtime/bemo-documentation-runtime";

export class BemoDocumentationRuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("bemoDocumentationRuntime", BemoDocumentationRuntime);
    }
}