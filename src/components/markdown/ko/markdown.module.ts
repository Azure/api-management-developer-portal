import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { MarkdownModelBinder } from "../markdownModelBinder";
import { MarkdownViewModelBinder } from "./markdownViewModelBinder";

export class MarkdownModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("modelBinders", MarkdownModelBinder);
        injector.bindToCollection("viewModelBinders", MarkdownViewModelBinder);
    }
}