import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { SignupHandlers } from "./signupHandlers";
import { SignupEditor } from "./ko/signupEditor";

export class SignupDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("signupEditor", SignupEditor);
        injector.bindToCollection("widgetHandlers", SignupHandlers, "signupHandlers");
    }
}