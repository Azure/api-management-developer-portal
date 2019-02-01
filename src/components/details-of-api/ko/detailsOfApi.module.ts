import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { IViewModelBinder } from "@paperbits/common/widgets";
import { DetailsOfApiModelBinder } from "../detailsOfApiModelBinder";
import { DetailsOfApiViewModelBinder } from "./detailsOfApiViewModelBinder";
import { IModelBinder } from "@paperbits/common/editing";

export class DetailsOfApiModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("detailsOfApiModelBinder", DetailsOfApiModelBinder);
        const modelBinders = injector.resolve<Array<IModelBinder>>("modelBinders");
        modelBinders.push(injector.resolve("detailsOfApiModelBinder"));

        injector.bind("detailsOfApiViewModelBinder", DetailsOfApiViewModelBinder);
        const viewModelBinders = injector.resolve<Array<IViewModelBinder<any, any>>>("viewModelBinders");
        viewModelBinders.push(injector.resolve("detailsOfApiViewModelBinder"));
    }
}