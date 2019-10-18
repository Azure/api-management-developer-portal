import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ValidationErrorModelBinder } from "../validationErrorModelBinder";
import { ValidationErrorViewModelBinder } from "./validationErrorViewModelBinder";


export class ValidationErrorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("modelBinders", ValidationErrorModelBinder);
        injector.bindToCollection("viewModelBinders", ValidationErrorViewModelBinder);
    }
}