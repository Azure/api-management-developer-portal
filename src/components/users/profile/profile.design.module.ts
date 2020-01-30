import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ProfileHandlers } from "./profileHandlers";

export class ProfileDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("widgetHandlers", ProfileHandlers);
    }
}