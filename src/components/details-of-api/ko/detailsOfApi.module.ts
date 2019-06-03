import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { DetailsOfApiModelBinder } from "../detailsOfApiModelBinder";
import { DetailsOfApiViewModelBinder } from "./detailsOfApiViewModelBinder";


export class DetailsOfApiModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("modelBinders", DetailsOfApiModelBinder);
        injector.bindToCollection("viewModelBinders", DetailsOfApiViewModelBinder);
    }
}