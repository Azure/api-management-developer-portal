import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ListOfApisModelBinder } from "../listOfApisModelBinder";
import { ListOfApisViewModelBinder } from "./listOfApisViewModelBinder";


export class ListOfApisModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("modelBinders", ListOfApisModelBinder);
        injector.bindToCollection("viewModelBinders", ListOfApisViewModelBinder);
    }
}