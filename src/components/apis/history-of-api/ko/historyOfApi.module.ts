import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { HistoryOfApiModelBinder } from "../historyOfApiModelBinder";
import { HistoryOfApiViewModelBinder } from "./historyOfApiViewModelBinder";


export class HistoryOfApiModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("modelBinders", HistoryOfApiModelBinder);
        injector.bindToCollection("viewModelBinders", HistoryOfApiViewModelBinder);
    }
}