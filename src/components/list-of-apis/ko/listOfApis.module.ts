import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ViewModelBinder } from "@paperbits/common/widgets";
import { ListOfApisModelBinder } from "../listOfApisModelBinder";
import { ListOfApisViewModelBinder } from "./listOfApisViewModelBinder";
import { IModelBinder } from "@paperbits/common/editing";

export class ListOfApisModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("listOfApisModelBinder", ListOfApisModelBinder);
        const modelBinders = injector.resolve<Array<IModelBinder>>("modelBinders");
        modelBinders.push(injector.resolve("listOfApisModelBinder"));

        injector.bind("listOfApisViewModelBinder", ListOfApisViewModelBinder);
        const viewModelBinders = injector.resolve<Array<ViewModelBinder<any, any>>>("viewModelBinders");
        viewModelBinders.push(injector.resolve("listOfApisViewModelBinder"));
    }
}