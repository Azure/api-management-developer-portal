import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { IViewModelBinder } from "@paperbits/common/widgets";
import { DocumentationModelBinder } from "../documentationModelBinder";
import { DocumentationViewModelBinder } from "./documentationViewModelBinder";
import { IModelBinder } from "@paperbits/common/editing";

export class DocumentationModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("documentationModelBinder", DocumentationModelBinder);
        const modelBinders = injector.resolve<IModelBinder[]>("modelBinders");
        modelBinders.push(injector.resolve("documentationModelBinder"));

        injector.bind("documentationViewModelBinder", DocumentationViewModelBinder);
        const viewModelBinders = injector.resolve<IViewModelBinder<any, any>[]>("viewModelBinders");
        viewModelBinders.push(injector.resolve("documentationViewModelBinder"));
    }
}