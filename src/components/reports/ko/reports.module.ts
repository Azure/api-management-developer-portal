import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ReportsModelBinder } from "../reportsModelBinder";
import { ReportsViewModelBinder } from "./reportsViewModelBinder";


export class ReportsModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("modelBinders", ReportsModelBinder);
        injector.bindToCollection("viewModelBinders", ReportsViewModelBinder);
    }
}